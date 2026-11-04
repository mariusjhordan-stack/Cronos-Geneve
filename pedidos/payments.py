"""Integración server-side de Mercado Pago Checkout Pro (Preferences API)."""
import hashlib
import hmac
import json
import logging
from datetime import timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen
from uuid import UUID

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from catalogo.models import Reloj
from .models import DetalleOrden, Orden, PagoMercadoPago

logger = logging.getLogger(__name__)
CENTAVO = Decimal('0.01')


class PaymentConfigurationError(Exception):
    """Configuración de sandbox incompleta o insegura."""


class PaymentProviderError(Exception):
    """Mercado Pago no respondió con una operación válida."""

    def __init__(self, message, *, category='api', status_code=None):
        super().__init__(message)
        self.category = category
        self.status_code = status_code


class ProductUnavailableError(ValueError):
    """El producto solicitado no existe en el catálogo."""


def _https_url(value, name):
    parsed = urlparse(value or '')
    if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
        raise PaymentConfigurationError(f'{name} debe ser una URL HTTPS pública.')
    if parsed.hostname in {'localhost', '127.0.0.1', '::1'}:
        raise PaymentConfigurationError(f'{name} debe ser accesible desde Mercado Pago.')
    return value.rstrip('/')


def payment_config(require_webhook=True):
    token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', '').strip()
    environment = getattr(settings, 'MERCADOPAGO_ENVIRONMENT', '').strip().lower()
    if environment != 'test':
        raise PaymentConfigurationError(
            'MERCADOPAGO_ENVIRONMENT debe ser "test"; el entorno de producción no está habilitado.'
        )
    if not token:
        raise PaymentConfigurationError('Configura un Access Token de Mercado Pago del entorno de prueba.')
    secret = getattr(settings, 'MERCADOPAGO_WEBHOOK_SECRET', '')
    if require_webhook and not secret:
        raise PaymentConfigurationError('Configura la firma secreta del Webhook de Mercado Pago.')
    try:
        rate = Decimal(getattr(settings, 'MERCADOPAGO_USD_PEN_RATE', ''))
    except (InvalidOperation, TypeError):
        raise PaymentConfigurationError('Configura un tipo de cambio USD/PEN válido.') from None
    if not rate.is_finite() or rate <= 0:
        raise PaymentConfigurationError('El tipo de cambio USD/PEN debe ser mayor que cero.')
    return_base = _https_url(getattr(settings, 'MERCADOPAGO_RETURN_BASE_URL', ''), 'MERCADOPAGO_RETURN_BASE_URL')
    webhook_url = _https_url(getattr(settings, 'MERCADOPAGO_WEBHOOK_URL', ''), 'MERCADOPAGO_WEBHOOK_URL')
    minutes = int(getattr(settings, 'MERCADOPAGO_RESERVATION_MINUTES', 30))
    if not 5 <= minutes <= 1440:
        raise PaymentConfigurationError('El plazo de reserva debe estar entre 5 y 1440 minutos.')
    return {
        'token': token,
        'environment': environment,
        'secret': secret,
        'rate': rate,
        'return_base': return_base,
        'webhook_url': webhook_url,
        'minutes': minutes,
        'api_base': getattr(settings, 'MERCADOPAGO_API_BASE_URL', 'https://api.mercadopago.com').rstrip('/'),
    }


def _api_request(method, path, body=None):
    config = payment_config(require_webhook=False)
    data = None if body is None else json.dumps(body, separators=(',', ':')).encode('utf-8')
    headers = {'Authorization': f"Bearer {config['token']}", 'Accept': 'application/json'}
    if data is not None:
        headers['Content-Type'] = 'application/json'
    request = Request(f"{config['api_base']}{path}", data=data, headers=headers, method=method)
    try:
        with urlopen(request, timeout=12) as response:
            response_body = response.read()
    except HTTPError as exc:
        if exc.code in (401, 403):
            logger.warning('Mercado Pago rechazó autenticación HTTP %s.', exc.code)
            raise PaymentProviderError(
                'Mercado Pago rechazó el Access Token (HTTP 401/403). Verifica que corresponda al entorno de prueba.',
                category='authentication',
                status_code=exc.code,
            ) from None
        logger.warning('Mercado Pago respondió con error HTTP %s.', exc.code)
        raise PaymentProviderError(
            f'Mercado Pago respondió con un error de API (HTTP {exc.code}).',
            category='api',
            status_code=exc.code,
        ) from None
    except (URLError, TimeoutError, OSError) as exc:
        # No se registran encabezados, tokens, cuerpos de respuesta ni datos del comprador.
        logger.warning('Mercado Pago no completó la solicitud (%s).', type(exc).__name__)
        raise PaymentProviderError(
            'No fue posible comunicarse con Mercado Pago.', category='network'
        ) from None
    try:
        parsed = json.loads(response_body.decode('utf-8'))
    except (UnicodeDecodeError, ValueError):
        raise PaymentProviderError('Mercado Pago devolvió una respuesta inválida.', category='api') from None
    if not isinstance(parsed, dict):
        raise PaymentProviderError('Mercado Pago devolvió una respuesta inválida.')
    return parsed


def reserve_order(order_data, item_qty_map, user=None, idempotency_key=None):
    """Crea orden y descuenta stock como reserva temporal, una sola vez por clave."""
    config = payment_config()
    if idempotency_key:
        existing = Orden.objects.filter(clave_idempotencia=idempotency_key).first()
        if existing:
            return existing, False

    reloj_ids = list(item_qty_map)
    try:
        with transaction.atomic():
            relojes = Reloj.objects.select_for_update().filter(id__in=reloj_ids).select_related('marca')
            reloj_map = {reloj.id: reloj for reloj in relojes}
            for reloj_id, cantidad in item_qty_map.items():
                reloj = reloj_map.get(reloj_id)
                if not reloj:
                    raise ProductUnavailableError(f'La pieza con ID {reloj_id} ya no está disponible.')
                if reloj.stock < cantidad:
                    raise ValueError(f"Stock insuficiente para '{reloj.marca.nombre} {reloj.nombre}'.")

            order = Orden.objects.create(
                **order_data,
                usuario=user if user and user.is_authenticated else None,
                estado=Orden.EstadoOrden.PENDIENTE,
                estado_pago=Orden.EstadoPago.PENDIENTE,
                moneda_pago='PEN',
                clave_idempotencia=idempotency_key,
                stock_reservado=True,
                reserva_expira_en=timezone.now() + timedelta(minutes=config['minutes']),
            )
            for reloj_id, cantidad in item_qty_map.items():
                reloj = reloj_map[reloj_id]
                DetalleOrden.objects.create(
                    orden=order,
                    reloj=reloj,
                    precio_unitario=reloj.precio,
                    cantidad=cantidad,
                )
                reloj.stock -= cantidad
                reloj.save(update_fields=['stock'])
            order.refresh_from_db()

            total_pen = Decimal('0.00')
            for detail in order.detalles.all():
                unit_pen = (detail.precio_unitario * config['rate']).quantize(CENTAVO, rounding=ROUND_HALF_UP)
                total_pen += unit_pen * detail.cantidad
            order.monto_pago = total_pen.quantize(CENTAVO, rounding=ROUND_HALF_UP)
            order.save(update_fields=['monto_pago'])
        return order, True
    except IntegrityError:
        if idempotency_key:
            existing = Orden.objects.filter(clave_idempotencia=idempotency_key).first()
            if existing:
                return existing, False
        raise


def create_preference(order):
    """Crea una preferencia con importes calculados y congelados por el servidor."""
    if order.url_pago and order.preferencia_pago_id:
        return order.url_pago
    config = payment_config()
    items = []
    for detail in order.detalles.select_related('reloj').all():
        unit_pen = (detail.precio_unitario * config['rate']).quantize(CENTAVO, rounding=ROUND_HALF_UP)
        items.append({
            'id': str(detail.reloj_id),
            'title': detail.reloj.nombre[:256],
            'quantity': detail.cantidad,
            'currency_id': 'PEN',
            'unit_price': float(unit_pen),
        })
    if not items or sum(Decimal(str(item['unit_price'])) * item['quantity'] for item in items) != order.monto_pago:
        raise PaymentProviderError('El importe de la orden no coincide con sus detalles.')

    return_url = f"{config['return_base']}/pago/retorno"
    back_urls = {
        name: f'{return_url}?{urlencode({"external_reference": str(order.referencia_pago), "resultado": name})}'
        for name in ('success', 'pending', 'failure')
    }
    expires_at = order.reserva_expira_en or (timezone.now() + timedelta(minutes=config['minutes']))
    payload = {
        'items': items,
        'payer': {'email': order.cliente_email},
        'external_reference': str(order.referencia_pago),
        'currency_id': 'PEN',
        'notification_url': config['webhook_url'],
        'back_urls': back_urls,
        'auto_return': 'approved',
        'expires': True,
        'expiration_date_from': timezone.now().isoformat(),
        'expiration_date_to': expires_at.isoformat(),
    }
    response = _api_request('POST', '/checkout/preferences', payload)
    sandbox_url = response.get('sandbox_init_point')
    parsed = urlparse(sandbox_url or '')
    sandbox_host = parsed.hostname or ''
    if (
        not response.get('id')
        or parsed.scheme != 'https'
        or not sandbox_host.startswith('sandbox.')
        or not (sandbox_host.endswith('mercadopago.com') or sandbox_host.endswith('mercadopago.com.pe'))
    ):
        raise PaymentProviderError('Mercado Pago no devolvió una URL de Checkout de prueba válida.')
    order.preferencia_pago_id = str(response['id'])
    order.url_pago = sandbox_url
    order.save(update_fields=['preferencia_pago_id', 'url_pago'])
    return sandbox_url


def release_reservation(order_id, payment_status=Orden.EstadoPago.EXPIRADO):
    """Libera inventario una sola vez; llamada solo tras confirmar terminalidad."""
    with transaction.atomic():
        order = Orden.objects.select_for_update().get(pk=order_id)
        if not order.stock_reservado:
            return order
        details = list(order.detalles.select_related('reloj').all())
        watches = {
            watch.id: watch
            for watch in Reloj.objects.select_for_update().filter(id__in=[detail.reloj_id for detail in details])
        }
        for detail in details:
            watch = watches.get(detail.reloj_id)
            if watch:
                watch.stock += detail.cantidad
                watch.save(update_fields=['stock'])
        order.stock_reservado = False
        order.reserva_expira_en = None
        order.estado_pago = payment_status
        order.estado = Orden.EstadoOrden.CANCELADO
        order.save(update_fields=['stock_reservado', 'reserva_expira_en', 'estado_pago', 'estado', 'actualizado_en'])
        return order


def verify_webhook_signature(signature, request_id, data_id, secret=None):
    secret = secret if secret is not None else getattr(settings, 'MERCADOPAGO_WEBHOOK_SECRET', '')
    if not signature or not request_id or not data_id or not secret:
        return False
    parts = {}
    for item in signature.split(','):
        key, separator, value = item.strip().partition('=')
        if separator:
            parts[key] = value
    timestamp, received = parts.get('ts'), parts.get('v1')
    if not timestamp or not received:
        return False
    manifest = f'id:{str(data_id).lower()};request-id:{request_id};ts:{timestamp};'
    calculated = hmac.new(secret.encode('utf-8'), manifest.encode('utf-8'), hashlib.sha256).hexdigest()
    return hmac.compare_digest(calculated, received)


def _validated_payment(payment):
    try:
        external_reference = UUID(str(payment.get('external_reference')))
        payment_id = str(payment['id'])
        amount = Decimal(str(payment['transaction_amount'])).quantize(CENTAVO)
    except (KeyError, TypeError, ValueError, InvalidOperation):
        raise PaymentProviderError('El pago consultado no contiene referencias válidas.') from None
    if not payment_id.isdigit() or payment.get('currency_id') != 'PEN' or payment.get('live_mode') is not False:
        raise PaymentProviderError('El pago no corresponde a una transacción válida de prueba en PEN.')
    state = payment.get('status')
    state_map = {
        'approved': Orden.EstadoPago.APROBADO,
        'pending': Orden.EstadoPago.PENDIENTE,
        'in_process': Orden.EstadoPago.PENDIENTE,
        'authorized': Orden.EstadoPago.PENDIENTE,
        'rejected': Orden.EstadoPago.RECHAZADO,
        'cancelled': Orden.EstadoPago.CANCELADO,
        'refunded': Orden.EstadoPago.REEMBOLSADO,
        'charged_back': Orden.EstadoPago.CONTRACARGO,
    }
    if state not in state_map:
        raise PaymentProviderError('El pago tiene un estado no soportado.')
    return external_reference, payment_id, amount, state_map[state], state


def reconcile_payment(payment):
    """Aplica solo una respuesta consultada con credenciales y ligada a su orden."""
    reference, payment_id, amount, normalized_state, provider_state = _validated_payment(payment)
    try:
        with transaction.atomic():
            order = Orden.objects.select_for_update().get(referencia_pago=reference)
            if order.moneda_pago != 'PEN' or order.monto_pago != amount:
                raise PaymentProviderError('El importe verificado no coincide con la orden.')
            approved_before = order.pagos_gateway.filter(estado=Orden.EstadoPago.APROBADO).exists()
            event, created = PagoMercadoPago.objects.get_or_create(
                payment_id=payment_id,
                defaults={
                    'orden': order,
                    'estado': normalized_state,
                    'detalle_estado': str(payment.get('status_detail', ''))[:100],
                    'monto': amount,
                    'moneda': 'PEN',
                    'external_reference': reference,
                },
            )
            if not created and event.orden_id != order.id:
                raise PaymentProviderError('La referencia del pago no coincide con la orden.')
            if not created:
                # Ignora regresiones causadas por notificaciones fuera de orden.
                if event.estado == Orden.EstadoPago.APROBADO and normalized_state not in (
                    Orden.EstadoPago.REEMBOLSADO, Orden.EstadoPago.CONTRACARGO,
                ):
                    normalized_state = event.estado
                event.estado = normalized_state
                event.detalle_estado = str(payment.get('status_detail', ''))[:100]
                event.save(update_fields=['estado', 'detalle_estado', 'actualizado_en'])

            approved = order.pagos_gateway.filter(estado=Orden.EstadoPago.APROBADO).exists()
            if normalized_state == Orden.EstadoPago.APROBADO and not approved_before:
                if not order.stock_reservado:
                    details = list(order.detalles.all())
                    watches = {
                        watch.id: watch
                        for watch in Reloj.objects.select_for_update().filter(id__in=[d.reloj_id for d in details])
                    }
                    if all(watches.get(d.reloj_id) and watches[d.reloj_id].stock >= d.cantidad for d in details):
                        for detail in details:
                            watch = watches[detail.reloj_id]
                            watch.stock -= detail.cantidad
                            watch.save(update_fields=['stock'])
                    else:
                        order.conflicto_stock_pago = True
                order.estado_pago = Orden.EstadoPago.APROBADO
                order.estado = Orden.EstadoOrden.PAGADO
                order.pago_gateway_id = payment_id
                order.stock_reservado = False
                order.reserva_expira_en = None
            elif approved:
                order.estado_pago = Orden.EstadoPago.APROBADO
                order.estado = Orden.EstadoOrden.PAGADO
                order.stock_reservado = False
                order.reserva_expira_en = None
            else:
                order.estado_pago = normalized_state
            order.pago_actualizado_en = timezone.now()
            order.save(update_fields=[
                'estado_pago', 'estado', 'pago_gateway_id', 'stock_reservado',
                'reserva_expira_en', 'conflicto_stock_pago', 'pago_actualizado_en', 'actualizado_en',
            ])
            return order
    except Orden.DoesNotExist:
        raise PaymentProviderError('No existe una orden para la referencia del pago.') from None


def fetch_payment(payment_id):
    if not str(payment_id).isdigit():
        raise PaymentProviderError('Identificador de pago inválido.')
    return _api_request('GET', f'/v1/payments/{payment_id}')


def search_payments(external_reference):
    path = f'/v1/payments/search?{urlencode({"external_reference": str(external_reference)})}'
    response = _api_request('GET', path)
    results = response.get('results', [])
    return results if isinstance(results, list) else []


def cancel_payment(payment_id):
    _api_request('PUT', f'/v1/payments/{payment_id}', {'status': 'cancelled'})
    return fetch_payment(payment_id)


def payment_status_for_reference(reference, payment_id=None):
    try:
        reference = UUID(str(reference))
        order = Orden.objects.get(referencia_pago=reference)
    except (ValueError, TypeError, Orden.DoesNotExist):
        raise PaymentProviderError('No se encontró el estado de pago solicitado.') from None
    if payment_id:
        payment = fetch_payment(payment_id)
        if str(payment.get('external_reference', '')) != str(reference):
            raise PaymentProviderError('El pago no corresponde a esta orden.')
        order = reconcile_payment(payment)
        order.refresh_from_db()
    return {
        'external_reference': str(order.referencia_pago),
        'estado_pago': order.estado_pago,
        'estado_orden': order.estado,
        'monto': str(order.monto_pago or ''),
        'moneda': order.moneda_pago,
    }
