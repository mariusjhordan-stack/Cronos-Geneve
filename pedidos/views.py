from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import Http404, JsonResponse
from django.utils.crypto import constant_time_compare
from django.views.decorators.http import require_GET, require_POST
from decimal import Decimal
from uuid import UUID, uuid4
import json

from catalogo.models import Reloj
from .models import Orden
from .payments import (
    PaymentConfigurationError,
    PaymentProviderError,
    create_preference,
    payment_config,
    release_reservation,
    reserve_order,
)


def _serializar_carrito(request):
    """
    Función auxiliar interna que reconstruye y valida el estado completo del carrito
    contra la base de datos para garantizar precios, disponibilidad y stock vigentes.
    """
    carrito = request.session.get('carrito', {})
    relojes_ids = [int(rid) for rid in carrito.keys() if str(rid).isdigit()]

    items = []
    total = Decimal('0.00')
    total_unidades = 0

    if relojes_ids:
        relojes = Reloj.objects.select_related('marca').filter(id__in=relojes_ids)
        reloj_map = {r.id: r for r in relojes}

        # Iterar sobre una copia para poder limpiar inconsistencias si fuera necesario
        for rid_str, cant in list(carrito.items()):
            try:
                rid = int(rid_str)
                if rid in reloj_map:
                    reloj = reloj_map[rid]
                    cantidad = int(cant)

                    # Si el stock cambió a 0 mientras estaba en sesión
                    if reloj.stock <= 0:
                        cantidad = 0
                    elif cantidad > reloj.stock:
                        cantidad = reloj.stock

                    if cantidad > 0:
                        subtotal = reloj.precio * cantidad
                        total += subtotal
                        total_unidades += cantidad

                        items.append({
                            'id': reloj.id,
                            'nombre': reloj.nombre,
                            'marca': reloj.marca.nombre,
                            'precio': float(reloj.precio),
                            'precio_formateado': f"${reloj.precio:,.2f}",
                            'cantidad': cantidad,
                            'stock_disponible': reloj.stock,
                            'imagen_url': reloj.imagen_url,
                            'subtotal': float(subtotal),
                            'subtotal_formateado': f"${subtotal:,.2f}",
                            'movimiento': reloj.get_movimiento_display(),
                            'diametro_caja_mm': float(reloj.diametro_caja_mm),
                        })
                    else:
                        del carrito[rid_str]
                        request.session.modified = True
                else:
                    del carrito[rid_str]
                    request.session.modified = True
            except (ValueError, TypeError):
                del carrito[rid_str]
                request.session.modified = True

    return {
        'items': items,
        'total': float(total),
        'total_formateado': f"${total:,.2f}",
        'total_unidades': total_unidades,
        'tiene_items': total_unidades > 0,
    }


@require_POST
def agregar_al_carrito(request, reloj_id):
    """
    Añade una pieza o incrementa su cantidad en el carrito de sesión.
    Responde tanto vía JSON (fetch asíncrono desde el drawer o catálogo)
    como por redirección convencional de respaldo.
    """
    reloj = get_object_or_404(Reloj, pk=reloj_id)

    if reloj.stock <= 0:
        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
            return JsonResponse({
                'success': False,
                'mensaje': f"La pieza '{reloj.nombre}' se encuentra agotada o en lista de espera.",
                'cart': _serializar_carrito(request)
            }, status=400)
        messages.error(request, f"La pieza '{reloj.nombre}' se encuentra actualmente agotada.")
        return redirect('catalogo:detalle', pk=reloj_id)

    # Inicializar carrito en sesión si no existe
    carrito = request.session.get('carrito', {})
    reloj_id_str = str(reloj_id)
    cantidad_actual = int(carrito.get(reloj_id_str, 0))

    # Determinar cantidad solicitada (soporta payload JSON o parámetro POST/GET)
    cantidad_a_agregar = 1
    if request.method == 'POST':
        try:
            if request.content_type == 'application/json':
                body = json.loads(request.body.decode('utf-8'))
                cantidad_a_agregar = int(body.get('cantidad', 1))
            else:
                cantidad_a_agregar = int(request.POST.get('cantidad', 1))
        except (ValueError, json.JSONDecodeError):
            cantidad_a_agregar = 1

    nueva_cantidad = cantidad_actual + cantidad_a_agregar

    # Validar contra el stock real de la manufactura
    if nueva_cantidad > reloj.stock:
        nueva_cantidad = reloj.stock
        alerta_stock = True
        mensaje = f"Se ha alcanzado el límite máximo en bóveda para '{reloj.nombre}' ({reloj.stock} disponible{'s' if reloj.stock > 1 else ''})."
    else:
        alerta_stock = False
        mensaje = f"'{reloj.marca.nombre} {reloj.nombre}' añadido con distinción a su selección privada."

    carrito[reloj_id_str] = nueva_cantidad
    request.session['carrito'] = carrito
    request.session.modified = True

    cart_data = _serializar_carrito(request)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
        return JsonResponse({
            'success': True,
            'alerta_stock': alerta_stock,
            'mensaje': mensaje,
            'cart': cart_data,
        })

    if alerta_stock:
        messages.warning(request, mensaje)
    else:
        messages.success(request, mensaje)

    # Redirección de respaldo al referrer o al catálogo
    referer = request.META.get('HTTP_REFERER')
    return redirect(referer if referer else 'catalogo:index')


@require_POST
def actualizar_cantidad(request, reloj_id):
    """
    Permite incrementar (+1), decrementar (-1) o establecer cantidad exacta
    directamente desde el Offcanvas drawer sin recargar la página.
    """
    reloj = get_object_or_404(Reloj, pk=reloj_id)
    carrito = request.session.get('carrito', {})
    reloj_id_str = str(reloj_id)

    if reloj_id_str not in carrito:
        return JsonResponse({'success': False, 'mensaje': 'La pieza no se encuentra en su bolsa.'}, status=404)

    accion = request.POST.get('accion')
    cantidad_actual = int(carrito[reloj_id_str])

    if accion == 'incrementar':
        if cantidad_actual < reloj.stock:
            carrito[reloj_id_str] = cantidad_actual + 1
            mensaje = f"Unidad añadida de '{reloj.nombre}'."
        else:
            return JsonResponse({
                'success': False,
                'mensaje': f"Disponibilidad máxima alcanzada ({reloj.stock} unidades).",
                'cart': _serializar_carrito(request)
            })
    elif accion == 'decrementar':
        if cantidad_actual > 1:
            carrito[reloj_id_str] = cantidad_actual - 1
            mensaje = f"Unidad retirada de '{reloj.nombre}'."
        else:
            del carrito[reloj_id_str]
            mensaje = f"'{reloj.nombre}' retirado de su selección privada."
    elif 'cantidad' in request.POST:
        try:
            nueva_cant = int(request.POST.get('cantidad'))
            if nueva_cant <= 0:
                del carrito[reloj_id_str]
                mensaje = f"'{reloj.nombre}' retirado de su bolsa."
            elif nueva_cant > reloj.stock:
                carrito[reloj_id_str] = reloj.stock
                mensaje = f"Ajustado al stock máximo disponible ({reloj.stock})."
            else:
                carrito[reloj_id_str] = nueva_cant
                mensaje = "Cantidad actualizada con éxito."
        except ValueError:
            return JsonResponse({'success': False, 'mensaje': 'Cantidad inválida.'}, status=400)
    else:
        return JsonResponse({'success': False, 'mensaje': 'Acción no especificada.'}, status=400)

    request.session['carrito'] = carrito
    request.session.modified = True

    cart_data = _serializar_carrito(request)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
        return JsonResponse({
            'success': True,
            'mensaje': mensaje,
            'cart': cart_data,
        })

    messages.info(request, mensaje)
    return redirect(request.META.get('HTTP_REFERER', 'catalogo:index'))


@require_POST
def eliminar_del_carrito(request, reloj_id):
    """
    Remueve por completo una pieza horológica de la bolsa de compras.
    """
    reloj = get_object_or_404(Reloj, pk=reloj_id)
    carrito = request.session.get('carrito', {})
    reloj_id_str = str(reloj_id)

    if reloj_id_str in carrito:
        del carrito[reloj_id_str]
        request.session['carrito'] = carrito
        request.session.modified = True
        mensaje = f"La pieza '{reloj.nombre}' ha sido retirada de su orden."
    else:
        mensaje = "La pieza especificada no formaba parte de su orden."

    cart_data = _serializar_carrito(request)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
        return JsonResponse({
            'success': True,
            'mensaje': mensaje,
            'cart': cart_data,
        })

    messages.info(request, mensaje)
    return redirect(request.META.get('HTTP_REFERER', 'catalogo:index'))


@require_POST
def vaciar_carrito(request):
    """
    Limpia todos los ítems de la sesión activa.
    """
    request.session['carrito'] = {}
    request.session.modified = True
    cart_data = _serializar_carrito(request)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
        return JsonResponse({
            'success': True,
            'mensaje': "Su bolsa de adquisición ha sido vaciada.",
            'cart': cart_data,
        })

    messages.info(request, "Su bolsa de adquisición ha sido vaciada.")
    return redirect(request.META.get('HTTP_REFERER', 'catalogo:index'))


@require_GET
def obtener_carrito_json(request):
    """
    Endpoint que devuelve el estado actual del carrito serializado en JSON.
    Permite refrescar el Offcanvas drawer en cualquier momento.
    """
    return JsonResponse(_serializar_carrito(request))


def checkout(request):
    """Checkout legado: reserva inventario y redirige al Checkout Pro de prueba."""
    cart_data = _serializar_carrito(request)

    if not cart_data['tiene_items']:
        messages.warning(request, "Su bolsa de adquisición se encuentra vacía. Explore nuestro catálogo para seleccionar piezas horológicas.")
        return redirect('catalogo:index')

    if request.method == 'POST':
        nombre = request.POST.get('nombre', '').strip()
        email = request.POST.get('email', '').strip()
        telefono = request.POST.get('telefono', '').strip()
        direccion = request.POST.get('direccion', '').strip()
        ciudad = request.POST.get('ciudad', 'Lima').strip()
        notas = request.POST.get('notas', '').strip()

        if not all([nombre, email, telefono, direccion]):
            messages.error(request, "Por favor complete todos los datos obligatorios para el protocolo de entrega segura.")
            return render(request, 'pedidos/checkout.html', {'cart': cart_data})

        try:
            validate_email(email)
        except ValidationError:
            messages.error(request, "El correo electrónico no tiene un formato válido.")
            return render(request, 'pedidos/checkout.html', {'cart': cart_data})

        if not request.POST.get('garantia_aceptada'):
            messages.error(request, "Debe aceptar los términos de la orden para continuar.")
            return render(request, 'pedidos/checkout.html', {'cart': cart_data})

        try:
            payment_config()
            raw_key = request.session.get('checkout_idempotency_key')
            idempotency_key = UUID(raw_key) if raw_key else uuid4()
            request.session['checkout_idempotency_key'] = str(idempotency_key)
            item_qty_map = {item['id']: item['cantidad'] for item in cart_data['items']}
            order_data = {
                'cliente_nombre': nombre,
                'cliente_email': email,
                'cliente_telefono': telefono,
                'direccion_envio': direccion,
                'ciudad': ciudad or 'Lima',
                'pais': request.POST.get('pais', 'Perú').strip() or 'Perú',
                'notas': notas,
                'garantia_aceptada': True,
            }
            orden, created = reserve_order(order_data, item_qty_map, request.user, idempotency_key)
            if orden.preferencia_pago_id and orden.url_pago:
                checkout_url = orden.url_pago
            elif created:
                checkout_url = create_preference(orden)
            else:
                raise PaymentProviderError('El checkout ya está siendo procesado.')
        except ValueError as err:
            messages.error(request, str(err))
            return render(request, 'pedidos/checkout.html', {'cart': _serializar_carrito(request)})
        except (PaymentConfigurationError, PaymentProviderError):
            if 'orden' in locals() and orden.stock_reservado:
                release_reservation(orden.id, Orden.EstadoPago.ERROR)
            request.session.pop('checkout_idempotency_key', None)
            messages.error(request, 'No se pudo iniciar el pago de prueba. La reserva fue liberada; inténtelo nuevamente más tarde.')
            return render(request, 'pedidos/checkout.html', {'cart': _serializar_carrito(request)})
        except Exception:
            if 'orden' in locals() and orden.stock_reservado:
                release_reservation(orden.id, Orden.EstadoPago.ERROR)
            request.session.pop('checkout_idempotency_key', None)
            logging.getLogger(__name__).exception('Error interno al iniciar Checkout Pro en checkout legado.')
            messages.error(request, 'No se pudo iniciar el pago. Inténtelo nuevamente más tarde.')
            return render(request, 'pedidos/checkout.html', {'cart': _serializar_carrito(request)})

        request.session['carrito'] = {}
        request.session.pop('checkout_idempotency_key', None)
        request.session.modified = True
        messages.info(request, 'La orden quedó reservada temporalmente. Complete el pago de prueba en Mercado Pago.')
        return redirect(checkout_url)

    return render(request, 'pedidos/checkout.html', {'cart': cart_data})


def pedido_confirmacion(request, orden_id):
    """
    Renderiza el Certificado Oficial de Autenticidad y Adquisición Horológica.
    Diseñado con soporte completo para exportación/impresión limpia en PDF (@media print).
    """
    orden = get_object_or_404(
        Orden.objects.prefetch_related('detalles__reloj__marca', 'detalles__reloj__categorias'),
        pk=orden_id
    )

    is_owner = request.user.is_authenticated and orden.usuario_id == request.user.pk
    access_token = request.GET.get('token', '')
    has_guest_access = bool(access_token) and constant_time_compare(access_token, str(orden.token_acceso))
    if not is_owner and not has_guest_access:
        raise Http404('Certificado no disponible.')

    # Generación de número de serie y registro notarial de bóveda
    numero_serie = f"CE-GENEVE-{orden.id:05d}-{orden.creado_en.strftime('%Y%m%d')}"

    context = {
        'orden': orden,
        'numero_serie': numero_serie,
        'codigo_orden': f"#CRONOS-{orden.id:05d}-2026",
    }
    return render(request, 'pedidos/confirmacion.html', context)
