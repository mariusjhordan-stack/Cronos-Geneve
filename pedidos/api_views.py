import logging
from uuid import UUID

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.shortcuts import get_object_or_404
from django.utils.crypto import constant_time_compare

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveAPIView

from catalogo.models import Reloj
from .models import Orden
from .serializers import OrdenSerializer
from .views import _serializar_carrito
from .payments import (
    PaymentConfigurationError,
    PaymentProviderError,
    ProductUnavailableError,
    create_preference,
    fetch_payment,
    payment_config,
    payment_status_for_reference,
    reconcile_payment,
    release_reservation,
    reserve_order,
    verify_webhook_signature,
)

logger = logging.getLogger(__name__)

MAX_ITEMS_POR_ORDEN = 20
MAX_CANTIDAD_POR_LINEA = 50
MAX_LEN = {
    'cliente_nombre': 150,
    'cliente_email': 254,
    'cliente_telefono': 30,
    'direccion_envio': 500,
    'ciudad': 100,
    'pais': 100,
    'notas': 2000,
}


def _texto(data, clave, requerido=True, default=''):
    """Extrae un campo de texto validando tipo y longitud. Devuelve (valor, error)."""
    valor = data.get(clave, default)
    if valor is None:
        valor = ''
    if not isinstance(valor, str):
        return None, f"El campo '{clave}' debe ser un texto."
    valor = valor.strip()
    if requerido and not valor:
        return None, f"El campo '{clave}' es obligatorio."
    if len(valor) > MAX_LEN.get(clave, 500):
        return None, f"El campo '{clave}' excede la longitud máxima permitida."
    return valor, None


class CheckoutAPIView(APIView):
    """Reserva inventario y crea una preferencia de pago Checkout Pro sandbox."""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            payment_config()
        except PaymentConfigurationError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        data = request.data
        if not isinstance(data, dict):
            return Response(
                {'error': 'El cuerpo de la solicitud debe ser un objeto JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cliente_nombre, err = _texto(data, 'cliente_nombre')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        cliente_email, err = _texto(data, 'cliente_email')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_email(cliente_email)
        except DjangoValidationError:
            return Response(
                {'error': 'El correo electrónico no tiene un formato válido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cliente_telefono, err = _texto(data, 'cliente_telefono')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        direccion_envio, err = _texto(data, 'direccion_envio')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        ciudad, err = _texto(data, 'ciudad', requerido=False, default='San Isidro, Lima')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        pais, err = _texto(data, 'pais', requerido=False, default='Perú')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        notas, err = _texto(data, 'notas', requerido=False, default='')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

        # P5: la aceptación de términos/garantía de la orden también se exige en backend.
        garantia = data.get('garantia_aceptada', False)
        if isinstance(garantia, str):
            garantia = garantia.strip().lower() in ('true', '1', 'yes', 'si', 'sí', 'on')
        if garantia is not True:
            return Response(
                {'error': 'Debe aceptar los términos de la orden para continuar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items = data.get('items', [])
        if not isinstance(items, list) or not items:
            return Response(
                {'error': 'La selección de piezas en bolsa está vacía.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(items) > MAX_ITEMS_POR_ORDEN:
            return Response(
                {'error': f'La orden supera el máximo de {MAX_ITEMS_POR_ORDEN} líneas permitido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # P4: validación estricta de IDs y cantidades (sin provocar 500).
        item_qty_map = {}
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                return Response(
                    {'error': f'La línea {idx + 1} tiene un formato inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            rid_raw = item.get('reloj_id', item.get('id', None))
            qty_raw = item.get('cantidad', 1)
            try:
                rid = int(rid_raw)
            except (TypeError, ValueError):
                return Response(
                    {'error': f'La línea {idx + 1} tiene un ID de reloj inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                qty = int(qty_raw)
            except (TypeError, ValueError):
                return Response(
                    {'error': f'La línea {idx + 1} tiene una cantidad inválida.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if rid <= 0:
                return Response(
                    {'error': f'La línea {idx + 1} tiene un ID de reloj inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if qty < 1 or qty > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La línea {idx + 1} tiene una cantidad fuera de rango (1-{MAX_CANTIDAD_POR_LINEA}).'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Consolidar duplicados sumando cantidades.
            item_qty_map[rid] = item_qty_map.get(rid, 0) + qty
            if item_qty_map[rid] > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La pieza con ID {rid} supera la cantidad máxima por orden.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reloj_ids = list(item_qty_map.keys())
        if not reloj_ids:
            return Response(
                {'error': 'No se encontraron piezas válidas para procesar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_idempotency_key = request.headers.get('Idempotency-Key', '')
        try:
            idempotency_key = UUID(raw_idempotency_key) if raw_idempotency_key else None
        except (TypeError, ValueError):
            return Response({'error': 'Clave de idempotencia inválida.'}, status=status.HTTP_400_BAD_REQUEST)

        order_data = {
            'cliente_nombre': cliente_nombre,
            'cliente_email': cliente_email,
            'cliente_telefono': cliente_telefono,
            'direccion_envio': direccion_envio,
            'ciudad': ciudad or 'San Isidro, Lima',
            'pais': pais or 'Perú',
            'notas': notas,
            'garantia_aceptada': True,
        }
        order = None
        try:
            order, created = reserve_order(order_data, item_qty_map, request.user, idempotency_key)
            if order.url_pago and order.preferencia_pago_id:
                checkout_url = order.url_pago
            elif not created:
                return Response(
                    {'error': 'El checkout de esta solicitud ya está en proceso. Intente nuevamente en unos segundos.'},
                    status=status.HTTP_409_CONFLICT,
                )
            else:
                checkout_url = create_preference(order)
        except ProductUnavailableError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except PaymentConfigurationError as exc:
            if order and order.stock_reservado:
                release_reservation(order.id, Orden.EstadoPago.ERROR)
            logger.warning('Checkout Pro rechazado por configuración inválida.')
            return Response(
                {'error': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except PaymentProviderError as exc:
            if order and order.stock_reservado:
                release_reservation(order.id, Orden.EstadoPago.ERROR)
            logger.warning(
                'Fallo de proveedor Checkout Pro (categoría=%s, HTTP=%s).',
                exc.category,
                exc.status_code or '-',
            )
            return Response(
                {'error': str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception:
            if order and order.stock_reservado:
                release_reservation(order.id, Orden.EstadoPago.ERROR)
            logger.exception('Error interno al iniciar Checkout Pro.')
            return Response({'error': 'No se pudo iniciar el pago.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if hasattr(request, 'session') and 'carrito' in request.session:
            request.session['carrito'] = {}
            request.session.modified = True
        serializer = OrdenSerializer(order)
        response_data = {
            'success': True,
            'mensaje': 'Orden creada. Continúe al checkout seguro de Mercado Pago para completar el pago.',
            'orden': serializer.data,
            'checkout_url': checkout_url,
            'external_reference': str(order.referencia_pago),
            'estado_pago': order.estado_pago,
        }
        if not request.user.is_authenticated:
            response_data['token_acceso'] = str(order.token_acceso)
        return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class OrdenDetailAPIView(APIView):
    """
    Endpoint para recuperar el comprobante de una orden emitida.
    GET /api/pedidos/ordenes/<id>/?token=<token_acceso>

    El token se entrega en la respuesta del checkout y es necesario para
    visualizar el comprobante. Sin token válido se responde 404 genérico
    para no confirmar la existencia de la orden ni exponer datos personales.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        token = request.query_params.get('token', '')
        if not token:
            return Response(
                {'error': 'Comprobante no disponible.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            orden = get_object_or_404(
                Orden.objects.prefetch_related('detalles__reloj__marca', 'detalles__reloj__categorias'),
                pk=pk,
            )
        except Exception:
            return Response(
                {'error': 'Comprobante no disponible.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not constant_time_compare(str(orden.token_acceso), str(token)):
            return Response(
                {'error': 'Comprobante no disponible.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrdenSerializer(orden)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MercadoPagoWebhookAPIView(APIView):
    """Valida la firma y consulta siempre el pago en la API autenticada."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        notification_type = request.query_params.get('type') or data.get('type') or request.query_params.get('topic')
        notification_data = data.get('data')
        if not isinstance(notification_data, dict):
            notification_data = {}
        data_id = request.query_params.get('data.id') or notification_data.get('id')
        signature = request.headers.get('x-signature', '')
        request_id = request.headers.get('x-request-id', '')
        if not verify_webhook_signature(signature, request_id, data_id):
            return Response({'error': 'Firma de notificación inválida.'}, status=status.HTTP_401_UNAUTHORIZED)
        if notification_type != 'payment':
            return Response({'received': True, 'ignored': True}, status=status.HTTP_200_OK)
        try:
            payment = fetch_payment(data_id)
            if str(payment.get('id')) != str(data_id):
                return Response({'error': 'Notificación inválida.'}, status=status.HTTP_400_BAD_REQUEST)
            reconcile_payment(payment)
        except PaymentProviderError:
            logger.warning('No se pudo reconciliar una notificación de pago verificada.')
            return Response({'error': 'No fue posible verificar el pago.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'received': True}, status=status.HTTP_200_OK)


class PaymentStatusAPIView(APIView):
    """Estado mínimo para el retorno; external_reference es una capability UUID."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, reference):
        try:
            result = payment_status_for_reference(reference, request.query_params.get('payment_id'))
        except PaymentProviderError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(result, status=status.HTTP_200_OK)


class CarritoValidateAPIView(APIView):
    """
    Valida un carrito del frontend (localStorage) contra precios y stock
    vigentes en el backend, sin modificar inventario.
    POST /api/pedidos/carrito/validar/
    Body: {"items": [{"reloj_id": 1, "cantidad": 2}]}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        items = data.get('items', [])
        if not isinstance(items, list) or not items:
            return Response(
                {'error': 'La selección de piezas está vacía.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(items) > MAX_ITEMS_POR_ORDEN:
            return Response(
                {'error': f'La selección supera el máximo de {MAX_ITEMS_POR_ORDEN} líneas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qty_map = {}
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                return Response(
                    {'error': f'La línea {idx + 1} tiene un formato inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                rid = int(item.get('reloj_id', item.get('id', 0)))
                qty = int(item.get('cantidad', 1))
            except (TypeError, ValueError):
                return Response(
                    {'error': f'La línea {idx + 1} tiene ID o cantidad inválidos.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if rid <= 0 or qty < 1 or qty > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La línea {idx + 1} tiene valores fuera de rango.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qty_map[rid] = qty_map.get(rid, 0) + qty
            if qty_map[rid] > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La pieza con ID {rid} supera la cantidad máxima por orden.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            relojes = Reloj.objects.select_related('marca').filter(id__in=list(qty_map.keys()))
            reloj_map = {r.id: r for r in relojes}
        except Exception:
            logger.exception('Error al validar el carrito')
            return Response(
                {'error': 'No fue posible validar la selección. Intente nuevamente.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        validados = []
        incidencias = []
        total = 0
        for rid, qty in qty_map.items():
            reloj = reloj_map.get(rid)
            if not reloj:
                incidencias.append(f'La pieza con ID {rid} ya no está disponible y fue retirada.')
                continue
            if reloj.stock <= 0:
                incidencias.append(f"'{reloj.marca.nombre} {reloj.nombre}' se encuentra agotada y fue retirada.")
                continue
            qty_final = min(qty, reloj.stock)
            if qty_final < qty:
                incidencias.append(
                    f"'{reloj.marca.nombre} {reloj.nombre}' ajustada a {qty_final} unidad(es) por stock disponible."
                )
            subtotal = float(reloj.precio) * qty_final
            total += subtotal
            validados.append({
                'id': reloj.id,
                'nombre': reloj.nombre,
                'marca_nombre': reloj.marca.nombre,
                'precio': float(reloj.precio),
                'stock': reloj.stock,
                'cantidad': qty_final,
                'subtotal': subtotal,
                'imagen_url': reloj.imagen_url,
            })

        return Response(
            {'items': validados, 'total': total, 'incidencias': incidencias},
            status=status.HTTP_200_OK,
        )


class CarritoSyncAPIView(APIView):
    """
    Endpoint para sincronizar el estado del carrito en sesión o validar piezas contra stock.
    GET /api/pedidos/carrito/
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_serializar_carrito(request), status=status.HTTP_200_OK)


class MisOrdenesAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrdenSerializer

    def get_queryset(self):
        return Orden.objects.filter(usuario=self.request.user).prefetch_related(
            'detalles__reloj__marca', 'detalles__reloj__categorias'
        )


class MiOrdenDetailAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrdenSerializer

    def get_queryset(self):
        return Orden.objects.filter(usuario=self.request.user).prefetch_related(
            'detalles__reloj__marca', 'detalles__reloj__categorias'
        )
