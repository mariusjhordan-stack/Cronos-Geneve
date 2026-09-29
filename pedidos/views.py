from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.db import transaction
from decimal import Decimal
import json

from catalogo.models import Reloj
from .models import Orden, DetalleOrden


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

    accion = request.POST.get('accion') or request.GET.get('accion')
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
    elif 'cantidad' in request.POST or 'cantidad' in request.GET:
        try:
            nueva_cant = int(request.POST.get('cantidad') or request.GET.get('cantidad'))
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


def obtener_carrito_json(request):
    """
    Endpoint que devuelve el estado actual del carrito serializado en JSON.
    Permite refrescar el Offcanvas drawer en cualquier momento.
    """
    return JsonResponse(_serializar_carrito(request))


def checkout(request):
    """
    Flujo de checkout multi-ítem integral.
    En un único bloque transaccional atómico (transaction.atomic):
    1. Bloquea las filas de inventario correspondientes con select_for_update().
    2. Valida la disponibilidad de stock de cada reloj solicitado.
    3. Crea la cabecera Orden.
    4. Genera los registros DetalleOrden con sus respectivos precios unitarios congelados.
    5. Descuenta el stock físico de cada pieza en inventario.
    6. Vacía el carrito de sesión y redirige al Certificado Oficial de Adquisición.
    """
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

        carrito = request.session.get('carrito', {})
        relojes_ids = [int(rid) for rid in carrito.keys() if str(rid).isdigit()]

        try:
            with transaction.atomic():
                # Bloqueo pesimista de filas para evitar condiciones de carrera concurrentes
                relojes_qs = Reloj.objects.select_for_update().filter(id__in=relojes_ids)
                reloj_map = {r.id: r for r in relojes_qs}

                # 1. Validación estricta de stock disponible para todas las piezas
                for rid_str, cant in carrito.items():
                    rid = int(rid_str)
                    cantidad_solicitada = int(cant)
                    reloj = reloj_map.get(rid)

                    if not reloj:
                        raise ValueError(f"Una de las piezas seleccionadas ya no está catalogada.")

                    if reloj.stock < cantidad_solicitada:
                        raise ValueError(
                            f"La manufactura '{reloj.marca.nombre} {reloj.nombre}' solo cuenta con {reloj.stock} "
                            f"unidad(es) disponible(s) en bóveda y usted solicitó {cantidad_solicitada}."
                        )

                # 2. Creación de la Orden Maestra
                orden = Orden.objects.create(
                    cliente_nombre=nombre,
                    cliente_email=email,
                    cliente_telefono=telefono,
                    direccion_envio=direccion,
                    ciudad=ciudad,
                    notas=notas,
                    estado=Orden.EstadoOrden.PAGADO,
                )

                # 3. Creación de cada DetalleOrden y descuento atómico de inventario
                for rid_str, cant in carrito.items():
                    rid = int(rid_str)
                    cantidad_solicitada = int(cant)
                    reloj = reloj_map[rid]

                    DetalleOrden.objects.create(
                        orden=orden,
                        reloj=reloj,
                        precio_unitario=reloj.precio,
                        cantidad=cantidad_solicitada
                    )

                    # Descuento en inventario
                    reloj.stock -= cantidad_solicitada
                    reloj.save(update_fields=['stock'])

                # 4. Cálculo final del total de la orden
                orden.actualizar_total()

                # 5. Limpieza de sesión
                request.session['carrito'] = {}
                request.session.modified = True

            messages.success(request, f"¡Transacción autorizada con éxito! Su orden #CRONOS-{orden.id:05d}-2026 ha sido emitida.")
            return redirect('pedidos:confirmacion', orden_id=orden.id)

        except ValueError as err:
            messages.error(request, str(err))
            return render(request, 'pedidos/checkout.html', {'cart': _serializar_carrito(request)})
        except Exception as e:
            messages.error(request, "Ocurrió un error al procesar la transacción en bóveda. Por favor intente nuevamente.")
            return render(request, 'pedidos/checkout.html', {'cart': _serializar_carrito(request)})

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

    # Generación de número de serie y registro notarial de bóveda
    numero_serie = f"CE-GENEVE-{orden.id:05d}-{orden.creado_en.strftime('%Y%m%d')}"

    context = {
        'orden': orden,
        'numero_serie': numero_serie,
        'codigo_orden': f"#CRONOS-{orden.id:05d}-2026",
    }
    return render(request, 'pedidos/confirmacion.html', context)
