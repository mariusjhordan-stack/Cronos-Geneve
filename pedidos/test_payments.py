import hashlib
import hmac
import os
from io import BytesIO, StringIO
from datetime import timedelta
from decimal import Decimal
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.error import HTTPError
from unittest.mock import patch

from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from catalogo.models import Marca, Reloj
from cronos_elite.settings import _load_local_payment_env
from pedidos.models import Orden, PagoMercadoPago
from pedidos.payments import (
    PaymentConfigurationError,
    PaymentProviderError,
    _api_request,
    create_preference,
    get_payment_diagnostics,
    payment_config,
    reconcile_payment,
    reserve_order,
)


MP_TEST_SETTINGS = {
    'PUBLIC_BASE_URL': 'https://shop.example.test',
    'MERCADOPAGO_ACCESS_TOKEN': 'APP_USR-test-credential',
    'MERCADOPAGO_ENVIRONMENT': 'test',
    'MERCADOPAGO_WEBHOOK_SECRET': 'webhook-test-secret',
    'MERCADOPAGO_WEBHOOK_URL': 'https://shop.example.test/api/pedidos/webhooks/mercadopago/',
    'MERCADOPAGO_RETURN_BASE_URL': 'https://shop.example.test',
    'MERCADOPAGO_USD_PEN_RATE': '3.75',
    'MERCADOPAGO_RESERVATION_MINUTES': 30,
}


class LocalPaymentEnvironmentTests(SimpleTestCase):
    def test_local_dotenv_values_are_loaded_without_overriding_process_values(self):
        with TemporaryDirectory(dir=Path.cwd()) as temp_dir, patch.dict(os.environ, {
            'PUBLIC_BASE_URL': '',
            'MERCADOPAGO_ACCESS_TOKEN': '',
            'MERCADOPAGO_ENVIRONMENT': '',
            'MERCADOPAGO_WEBHOOK_SECRET': 'process-secret-placeholder',
        }):
            env_path = Path(temp_dir) / '.env'
            env_path.write_text(
                'PUBLIC_BASE_URL=https://shop.example.test\n'
                'MERCADOPAGO_ACCESS_TOKEN="APP_USR-fixture-token"\n'
                'MERCADOPAGO_ENVIRONMENT=test\n'
                'MERCADOPAGO_WEBHOOK_SECRET=file-secret-placeholder\n',
                encoding='utf-8',
            )
            _load_local_payment_env(env_path)
            self.assertEqual(os.environ['PUBLIC_BASE_URL'], 'https://shop.example.test')
            self.assertEqual(os.environ['MERCADOPAGO_ENVIRONMENT'], 'test')
            self.assertEqual(os.environ['MERCADOPAGO_ACCESS_TOKEN'], 'APP_USR-fixture-token')
            self.assertEqual(os.environ['MERCADOPAGO_WEBHOOK_SECRET'], 'process-secret-placeholder')


@override_settings(**MP_TEST_SETTINGS)
class MercadoPagoCheckoutTests(TestCase):
    def setUp(self):
        self.brand = Marca.objects.create(nombre='Maison Pago')
        self.watch = Reloj.objects.create(
            nombre='Référence Sandbox', marca=self.brand, precio=Decimal('8000.00'), stock=5,
            diametro_caja_mm=Decimal('40.0'), descripcion='Reloj para pruebas de pago',
        )
        self.client = APIClient()

    def payload(self, **overrides):
        data = {
            'cliente_nombre': 'Cliente Prueba',
            'cliente_email': 'sandbox@example.test',
            'cliente_telefono': '+51123456789',
            'direccion_envio': 'Av. Prueba 100',
            'garantia_aceptada': True,
            'items': [{'reloj_id': self.watch.id, 'cantidad': 1}],
        }
        data.update(overrides)
        return data

    def create_order(self, quantity=1, key=None):
        data = {
            'cliente_nombre': 'Cliente Prueba', 'cliente_email': 'sandbox@example.test',
            'cliente_telefono': '+51123456789', 'direccion_envio': 'Av. Prueba 100',
            'garantia_aceptada': True,
        }
        order, created = reserve_order(data, {self.watch.id: quantity}, idempotency_key=key)
        self.assertTrue(created)
        return order

    def persist_mock_preference(self, order):
        order.preferencia_pago_id = f'pref-test-{order.pk}'
        order.url_pago = 'https://sandbox.mercadopago.com/checkout/mock'
        order.save(update_fields=['preferencia_pago_id', 'url_pago'])
        return order.url_pago

    def gateway_payment(self, order, payment_id='900001', state='approved', amount='30000.00'):
        return {
            'id': payment_id,
            'external_reference': str(order.referencia_pago),
            'transaction_amount': amount,
            'currency_id': 'PEN',
            'live_mode': False,
            'status': state,
            'status_detail': f'{state}_test',
        }

    def signed_webhook_headers(self, data_id, request_id='request-test-1'):
        timestamp = '1700000000'
        manifest = f'id:{str(data_id).lower()};request-id:{request_id};ts:{timestamp};'
        digest = hmac.new(
            MP_TEST_SETTINGS['MERCADOPAGO_WEBHOOK_SECRET'].encode(),
            manifest.encode(), hashlib.sha256,
        ).hexdigest()
        return {'HTTP_X_REQUEST_ID': request_id, 'HTTP_X_SIGNATURE': f'ts={timestamp},v1={digest}'}

    @patch('pedidos.payments._api_request')
    def test_preference_uses_server_amount_pEN_and_unique_order_reference(self, mp_request):
        mp_request.return_value = {
            'id': 'pref-test-1',
            'sandbox_init_point': 'https://sandbox.mercadopago.com/checkout/pay?pref_id=pref-test-1',
        }
        response = self.client.post(
            '/api/pedidos/checkout/',
            self.payload(total='0.01', currency_id='USD', items=[{
                'reloj_id': self.watch.id, 'cantidad': 1, 'unit_price': 0.01,
            }]),
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        order = Orden.objects.get(pk=response.data['orden']['id'])
        self.assertEqual(order.total, Decimal('8000.00'))
        self.assertEqual(order.monto_pago, Decimal('30000.00'))
        self.assertEqual(order.moneda_pago, 'PEN')
        request_payload = mp_request.call_args.args[2]
        self.assertEqual(request_payload['external_reference'], str(order.referencia_pago))
        self.assertEqual(request_payload['items'][0]['currency_id'], 'PEN')
        self.assertEqual(request_payload['items'][0]['unit_price'], 30000.0)
        self.assertNotIn('0.01', str(request_payload['items']))
        self.assertTrue(response.data['checkout_url'].startswith('https://sandbox.'))
        self.assertEqual(self.watch.__class__.objects.get(pk=self.watch.pk).stock, 4)

    @patch('pedidos.api_views.create_preference')
    def test_checkout_idempotency_key_reuses_order_and_reservation(self, _create_preference):
        _create_preference.side_effect = self.persist_mock_preference
        key = 'e7738067-d09a-45ea-a44b-1f85f6386bb5'
        first = self.client.post('/api/pedidos/checkout/', self.payload(), format='json', HTTP_IDEMPOTENCY_KEY=key)
        second = self.client.post('/api/pedidos/checkout/', self.payload(), format='json', HTTP_IDEMPOTENCY_KEY=key)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.data['orden']['id'], second.data['orden']['id'])
        self.assertEqual(Orden.objects.count(), 1)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 4)

    @patch('pedidos.api_views.create_preference', side_effect=PaymentProviderError('offline'))
    def test_provider_unavailable_releases_reservation_and_does_not_claim_payment(self, _create_preference):
        response = self.client.post('/api/pedidos/checkout/', self.payload(), format='json')
        order = Orden.objects.get()
        self.assertEqual(response.status_code, 502)
        self.assertEqual(order.estado_pago, Orden.EstadoPago.ERROR)
        self.assertFalse(order.stock_reservado)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 5)
        self.assertNotEqual(order.estado, Orden.EstadoOrden.PAGADO)

    def test_configuration_accepts_app_usr_token_when_environment_is_test(self):
        with override_settings(
            MERCADOPAGO_ACCESS_TOKEN='APP_USR-test-token',
            MERCADOPAGO_ENVIRONMENT='test',
        ):
            config = payment_config()
        self.assertEqual(config['token'], 'APP_USR-test-token')
        self.assertEqual(config['environment'], 'test')

    @patch('pedidos.payments._api_request')
    def test_configuration_rejects_production_or_unknown_environment(self, mp_request):
        for environment in ('', 'production', 'live', 'unexpected'):
            with self.subTest(environment=environment), override_settings(
                MERCADOPAGO_ACCESS_TOKEN='APP_USR-credential',
                MERCADOPAGO_ENVIRONMENT=environment,
            ):
                response = self.client.post('/api/pedidos/checkout/', self.payload(), format='json')
                self.assertEqual(response.status_code, 503)
                self.assertFalse(Orden.objects.exists())
        mp_request.assert_not_called()

    def test_configuration_rejects_missing_access_token(self):
        with override_settings(MERCADOPAGO_ACCESS_TOKEN='', MERCADOPAGO_ENVIRONMENT='test'):
            response = self.client.post('/api/pedidos/checkout/', self.payload(), format='json')
        self.assertEqual(response.status_code, 503)
        self.assertFalse(Orden.objects.exists())

    @patch('pedidos.payments.urlopen')
    def test_api_sends_bearer_token_and_distinguishes_provider_auth_errors(self, urlopen_mock):
        urlopen_mock.side_effect = HTTPError(
            'https://api.mercadopago.com/users/me', 401, 'Unauthorized', {}, BytesIO(b'{}')
        )
        with self.assertRaises(PaymentProviderError) as raised:
            _api_request('GET', '/users/me')

        request = urlopen_mock.call_args.args[0]
        self.assertEqual(request.get_header('Authorization'), 'Bearer APP_USR-test-credential')
        self.assertEqual(raised.exception.category, 'authentication')
        self.assertEqual(raised.exception.status_code, 401)

    def test_payment_transitions_pending_approved_and_rejected_are_verified(self):
        order = self.create_order()
        pending = self.gateway_payment(order, state='pending')
        reconcile_payment(pending)
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.PENDIENTE)
        self.assertTrue(order.stock_reservado)

        approved = self.gateway_payment(order, state='approved')
        reconcile_payment(approved)
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.APROBADO)
        self.assertEqual(order.estado, Orden.EstadoOrden.PAGADO)
        self.assertFalse(order.stock_reservado)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 4)

        rejected_order = self.create_order()
        rejected = self.gateway_payment(rejected_order, payment_id='900002', state='rejected')
        reconcile_payment(rejected)
        rejected_order.refresh_from_db()
        self.assertEqual(rejected_order.estado_pago, Orden.EstadoPago.RECHAZADO)
        self.assertEqual(rejected_order.estado, Orden.EstadoOrden.CANCELADO)
        self.assertFalse(rejected_order.stock_reservado)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 4)

    def test_payment_with_wrong_amount_currency_or_reference_is_rejected(self):
        order = self.create_order()
        wrong_amount = self.gateway_payment(order, amount='1.00')
        with self.assertRaises(PaymentProviderError):
            reconcile_payment(wrong_amount)
        wrong_currency = self.gateway_payment(order)
        wrong_currency['currency_id'] = 'USD'
        with self.assertRaises(PaymentProviderError):
            reconcile_payment(wrong_currency)
        wrong_reference = self.gateway_payment(order)
        wrong_reference['external_reference'] = 'e7738067-d09a-45ea-a44b-1f85f6386bb5'
        with self.assertRaises(PaymentProviderError):
            reconcile_payment(wrong_reference)
        self.assertFalse(PagoMercadoPago.objects.exists())

    def test_invalid_webhook_signature_never_fetches_or_updates_payment(self):
        order = self.create_order()
        response = self.client.post(
            '/api/pedidos/webhooks/mercadopago/?type=payment&data.id=900003',
            {'type': 'payment', 'data': {'id': '900003'}}, format='json',
            HTTP_X_REQUEST_ID='request-test', HTTP_X_SIGNATURE='ts=1700000000,v1=invalid',
        )
        self.assertEqual(response.status_code, 401)
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.PENDIENTE)
        self.assertFalse(PagoMercadoPago.objects.exists())

    @patch('pedidos.api_views.fetch_payment')
    def test_repeated_signed_webhook_is_idempotent(self, fetch_mock):
        order = self.create_order()
        fetch_mock.return_value = self.gateway_payment(order, payment_id='900004')
        headers = self.signed_webhook_headers('900004')
        url = '/api/pedidos/webhooks/mercadopago/?type=payment&data.id=900004'
        for _ in range(2):
            response = self.client.post(url, {'type': 'payment', 'data': {'id': '900004'}}, format='json', **headers)
            self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.APROBADO)
        self.assertEqual(PagoMercadoPago.objects.filter(payment_id='900004').count(), 1)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 4)

    def test_return_status_query_cannot_claim_approval(self):
        order = self.create_order()
        response = self.client.get(
            f'/api/pedidos/pagos/{order.referencia_pago}/?status=approved&collection_status=approved'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['estado_pago'], Orden.EstadoPago.PENDIENTE)
        self.assertEqual(Orden.objects.get(pk=order.pk).estado, Orden.EstadoOrden.PENDIENTE)

    @patch('pedidos.management.commands.reconcile_expired_payments.search_payments', return_value=[])
    def test_expired_payment_without_gateway_payment_releases_reserved_stock(self, _search):
        order = self.create_order()
        order.reserva_expira_en = timezone.now() - timedelta(minutes=1)
        order.save(update_fields=['reserva_expira_en'])
        call_command('reconcile_expired_payments', verbosity=0)
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.EXPIRADO)
        self.assertFalse(order.stock_reservado)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 5)
    def test_payment_cancellation_releases_reserved_stock_immediately(self):
        cancelled_order = self.create_order()
        cancelled = self.gateway_payment(cancelled_order, payment_id='900099', state='cancelled')
        reconcile_payment(cancelled)
        cancelled_order.refresh_from_db()
        self.assertEqual(cancelled_order.estado_pago, Orden.EstadoPago.CANCELADO)
        self.assertEqual(cancelled_order.estado, Orden.EstadoOrden.CANCELADO)
        self.assertFalse(cancelled_order.stock_reservado)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 5)

    def test_public_base_url_derives_return_and_webhook_urls(self):
        with override_settings(
            PUBLIC_BASE_URL='https://custom-tunnel.trycloudflare.com',
            MERCADOPAGO_RETURN_BASE_URL='',
            MERCADOPAGO_WEBHOOK_URL='',
            MERCADOPAGO_ACCESS_TOKEN='APP_USR-test-token',
            MERCADOPAGO_ENVIRONMENT='test',
            MERCADOPAGO_WEBHOOK_SECRET='secret',
            MERCADOPAGO_USD_PEN_RATE='3.75',
        ):
            config = payment_config()
            self.assertEqual(config['return_base'], 'https://custom-tunnel.trycloudflare.com')
            self.assertEqual(config['webhook_url'], 'https://custom-tunnel.trycloudflare.com/api/pedidos/webhooks/mercadopago/')

    @patch('pedidos.payments._api_request')
    def test_preference_is_regenerated_when_public_base_url_changes(self, mp_request):
        mp_request.side_effect = [
            {'id': 'pref-old', 'sandbox_init_point': 'https://sandbox.mercadopago.com/checkout/pay?pref_id=pref-old'},
            {'id': 'pref-new', 'sandbox_init_point': 'https://sandbox.mercadopago.com/checkout/pay?pref_id=pref-new'},
        ]
        order = self.create_order()
        with override_settings(PUBLIC_BASE_URL='https://tunnel-1.trycloudflare.com', MERCADOPAGO_RETURN_BASE_URL='', MERCADOPAGO_WEBHOOK_URL=''):
            url_1 = create_preference(order)
            self.assertIn('pref-old', url_1)
            self.assertEqual(order.preferencia_base_url, 'https://tunnel-1.trycloudflare.com')

        with override_settings(PUBLIC_BASE_URL='https://tunnel-2.trycloudflare.com', MERCADOPAGO_RETURN_BASE_URL='', MERCADOPAGO_WEBHOOK_URL=''):
            url_2 = create_preference(order)
            self.assertIn('pref-new', url_2)
            self.assertEqual(order.preferencia_base_url, 'https://tunnel-2.trycloudflare.com')

    @patch('pedidos.payments.fetch_payment')
    def test_return_status_with_valid_payment_id_reconciles_and_returns_order_metadata(self, fetch_mock):
        order = self.create_order()
        fetch_mock.return_value = self.gateway_payment(order, payment_id='900055', state='approved')
        response = self.client.get(
            f'/api/pedidos/pagos/{order.referencia_pago}/?payment_id=900055'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['estado_pago'], Orden.EstadoPago.APROBADO)
        self.assertEqual(response.data['orden_id'], order.id)
        self.assertEqual(response.data['token_acceso'], str(order.token_acceso))
        order.refresh_from_db()
        self.assertEqual(order.estado, Orden.EstadoOrden.PAGADO)
        self.assertFalse(order.stock_reservado)

    def test_frontend_and_backend_urls_can_use_separate_https_hosts(self):
        with override_settings(
            PUBLIC_BASE_URL='',
            FRONTEND_URL='https://cronos-frontend.example.test',
            BACKEND_PUBLIC_URL='https://cronos-api.example.test',
            MERCADOPAGO_RETURN_BASE_URL='',
            MERCADOPAGO_WEBHOOK_URL='',
        ):
            config = payment_config()
        self.assertEqual(config['return_base'], 'https://cronos-frontend.example.test')
        self.assertEqual(config['webhook_url'], 'https://cronos-api.example.test/api/pedidos/webhooks/mercadopago/')

    def test_payment_urls_must_still_use_https(self):
        with override_settings(
            PUBLIC_BASE_URL='',
            FRONTEND_URL='http://frontend.example.test',
            BACKEND_PUBLIC_URL='https://api.example.test',
            MERCADOPAGO_RETURN_BASE_URL='',
            MERCADOPAGO_WEBHOOK_URL='',
        ):
            with self.assertRaises(PaymentConfigurationError) as cm:
                payment_config()
            self.assertIn('HTTPS', str(cm.exception))

    def test_webhook_can_use_backend_host_when_return_uses_frontend_host(self):
        with override_settings(
            PUBLIC_BASE_URL='',
            FRONTEND_URL='https://frontend.example.test',
            BACKEND_PUBLIC_URL='',
            MERCADOPAGO_RETURN_BASE_URL='',
            MERCADOPAGO_WEBHOOK_URL='https://api.example.test/api/pedidos/webhooks/mercadopago',
        ):
            config = payment_config()
        self.assertEqual(config['return_base'], 'https://frontend.example.test')
        self.assertEqual(config['webhook_url'], 'https://api.example.test/api/pedidos/webhooks/mercadopago/')

    def test_check_mercadopago_command_runs_safely_without_leaking_secrets(self):
        out = StringIO()
        call_command('check_mercadopago', stdout=out)
        output = out.getvalue()
        self.assertIn('CRONOS GENÈVE', output)
        self.assertIn('PUBLIC_BASE_URL efectiva', output)
        self.assertIn('URL de Retorno efectiva', output)
        self.assertIn('URLs Coherentes', output)
        self.assertNotIn('APP_USR-test-credential', output)
        self.assertNotIn('webhook-test-secret', output)

    def test_pago_retorno_redirects_to_frontend_with_params(self):
        with override_settings(FRONTEND_URL='https://cronos-frontend.example.test'):
            response = self.client.get('/pago/retorno?external_reference=test-ref&payment_id=999999')
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.headers.get('Location', '').startswith('https://cronos-frontend.example.test/pago/retorno'))
        self.assertIn('external_reference=test-ref', response.headers.get('Location', ''))
        self.assertIn('payment_id=999999', response.headers.get('Location', ''))

    @patch('pedidos.api_views.fetch_payment')
    def test_id_123456_without_signature_is_rejected_before_provider_lookup(self, fetch_mock):
        order = self.create_order()
        stock_before = Reloj.objects.get(pk=self.watch.pk).stock
        response = self.client.post(
            '/api/pedidos/webhooks/mercadopago/?type=payment&data.id=123456',
            {'type': 'payment', 'data': {'id': '123456'}, 'action': 'payment.updated', 'live_mode': False},
            format='json',
        )
        self.assertEqual(response.status_code, 401)
        fetch_mock.assert_not_called()
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.PENDIENTE)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, stock_before)
        self.assertFalse(PagoMercadoPago.objects.exists())

    @patch('pedidos.api_views.fetch_payment')
    def test_id_123456_with_invalid_signature_is_rejected_before_provider_lookup(self, fetch_mock):
        response = self.client.post(
            '/api/pedidos/webhooks/mercadopago/?type=payment&data.id=123456',
            {'type': 'payment', 'data': {'id': '123456'}}, format='json',
            HTTP_X_REQUEST_ID='request-test', HTTP_X_SIGNATURE='ts=1700000000,v1=invalid',
        )
        self.assertEqual(response.status_code, 401)
        fetch_mock.assert_not_called()
        self.assertFalse(PagoMercadoPago.objects.exists())

    @patch('pedidos.api_views.fetch_payment')
    def test_valid_signed_payment_notification_fetches_authoritative_payment(self, fetch_mock):
        order = self.create_order()
        fetch_mock.return_value = self.gateway_payment(order, payment_id='900003')
        response = self.client.post(
            '/api/pedidos/webhooks/mercadopago/?type=payment&data.id=900003',
            {'type': 'payment', 'data': {'id': '900003'}, 'action': 'payment.updated'},
            format='json', **self.signed_webhook_headers('900003'),
        )
        self.assertEqual(response.status_code, 200)
        fetch_mock.assert_called_once_with('900003')
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.APROBADO)
        self.assertEqual(PagoMercadoPago.objects.filter(payment_id='900003').count(), 1)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, 4)

    @patch('pedidos.api_views.fetch_payment')
    def test_official_style_signed_simulation_with_unknown_id_is_acknowledged_without_changes(self, fetch_mock):
        order = self.create_order()
        stock_before = Reloj.objects.get(pk=self.watch.pk).stock
        fetch_mock.side_effect = PaymentProviderError(
            'Mercado Pago respondió con un error de API (HTTP 404).', status_code=404,
        )
        response = self.client.post(
            '/api/pedidos/webhooks/mercadopago/?type=payment&data.id=123456',
            {
                'action': 'payment.updated', 'api_version': 'v1',
                'data': {'id': '123456'}, 'id': '123456',
                'live_mode': False, 'type': 'payment', 'user_id': '3804835454',
            }, format='json', **self.signed_webhook_headers('123456'),
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['received'])
        self.assertFalse(response.data['processed'])
        fetch_mock.assert_called_once_with('123456')
        order.refresh_from_db()
        self.assertEqual(order.estado_pago, Orden.EstadoPago.PENDIENTE)
        self.assertTrue(order.stock_reservado)
        self.assertEqual(Reloj.objects.get(pk=self.watch.pk).stock, stock_before)
        self.assertFalse(PagoMercadoPago.objects.exists())

    @patch('pedidos.api_views.fetch_payment')
    def test_webhook_no_slash_url_is_accepted_with_valid_signature(self, fetch_mock):
        fetch_mock.side_effect = PaymentProviderError(
            'Mercado Pago respondió con un error de API (HTTP 404).', status_code=404,
        )
        response = self.client.post(
            '/api/pedidos/webhooks/mercadopago?type=payment&data.id=123456',
            {'type': 'payment', 'data': {'id': '123456'}}, format='json',
            **self.signed_webhook_headers('123456'),
        )
        self.assertEqual(response.status_code, 200)
        fetch_mock.assert_called_once_with('123456')

    @patch('pedidos.api_views.fetch_payment')
    def test_webhook_with_nonexistent_payment_returns_200_ok(self, fetch_mock):
        fetch_mock.side_effect = PaymentProviderError('Mercado Pago respondió con un error de API (HTTP 404).', status_code=404)
        headers = self.signed_webhook_headers('999999')
        response = self.client.post(
            '/api/pedidos/webhooks/mercadopago/?type=payment&data.id=999999',
            {'type': 'payment', 'data': {'id': '999999'}},
            format='json',
            **headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get('received'), True)
        self.assertEqual(response.data.get('processed'), False)
