from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalogo.models import Marca, Reloj

from .models import Orden

User = get_user_model()


class LegacyOrderCertificateAccessTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cliente', password='CronosGeneve!9274')
        self.order = Orden.objects.create(
            usuario=self.user,
            cliente_nombre='Cliente',
            cliente_email='cliente@example.com',
            cliente_telefono='+51123456789',
            direccion_envio='Dirección privada',
        )
        self.url = reverse('pedidos:confirmacion', kwargs={'orden_id': self.order.id})

    def test_legacy_certificate_requires_owner_or_guest_capability_token(self):
        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.assertEqual(self.client.get(f'{self.url}?token=invalid').status_code, 404)
        self.assertEqual(self.client.get(f'{self.url}?token={self.order.token_acceso}').status_code, 200)

        self.client.force_login(self.user)
        self.assertEqual(self.client.get(self.url).status_code, 200)


class OrdenCertificadoAccesoTests(APITestCase):
    """Fase 2.1 §3 — Certificado / órdenes: propietario, ajeno, invitado, token y 404."""

    def setUp(self):
        self.user_a = User.objects.create_user(username='usuario_a', email='a@example.com', password='CronosGeneve!9274')
        self.user_b = User.objects.create_user(username='usuario_b', email='b@example.com', password='CronosGeneve!9274')
        self.orden_a = Orden.objects.create(
            usuario=self.user_a, cliente_nombre='Usuario A', cliente_email='a@example.com',
            cliente_telefono='+51123456789', direccion_envio='Dirección A', garantia_aceptada=True,
        )
        self.orden_b = Orden.objects.create(
            usuario=self.user_b, cliente_nombre='Usuario B', cliente_email='b@example.com',
            cliente_telefono='+51987654321', direccion_envio='Dirección B', garantia_aceptada=True,
        )

    def test_a_propietario_puede_consultar_su_orden(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(f'/api/me/ordenes/{self.orden_a.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.orden_a.id)

    def test_b_usuario_no_puede_consultar_orden_ajena(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(f'/api/me/ordenes/{self.orden_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_c_certificado_invitado_con_token_correcto(self):
        response = self.client.get(f'/api/pedidos/ordenes/{self.orden_a.id}/?token={self.orden_a.token_acceso}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.orden_a.id)

    def test_d_token_incorrecto_y_ausente_rechazados(self):
        self.assertEqual(
            self.client.get(f'/api/pedidos/ordenes/{self.orden_a.id}/?token=00000000-0000-0000-0000-000000000000').status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.get(f'/api/pedidos/ordenes/{self.orden_a.id}/').status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_e_jwt_de_a_no_accede_a_orden_de_b(self):
        self.client.force_authenticate(user=self.user_a)
        # Historial propio: la orden de B no existe para A.
        self.assertEqual(
            self.client.get(f'/api/me/ordenes/{self.orden_b.id}/').status_code,
            status.HTTP_404_NOT_FOUND,
        )
        # Certificado invitado: el JWT de A no sustituye al token de la orden.
        self.assertEqual(
            self.client.get(f'/api/pedidos/ordenes/{self.orden_b.id}/').status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.get(f'/api/pedidos/ordenes/{self.orden_b.id}/?token=00000000-0000-0000-0000-000000000000').status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_f_id_inexistente_sin_500(self):
        self.client.force_authenticate(user=self.user_a)
        self.assertEqual(self.client.get('/api/me/ordenes/999999/').status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            self.client.get('/api/pedidos/ordenes/999999/?token=00000000-0000-0000-0000-000000000000').status_code,
            status.HTTP_404_NOT_FOUND,
        )


class CheckoutCasosEntradaTests(APITestCase):
    """Fase 2.1 §4 — Checkout: entradas inválidas no crean orden ni descuentan stock."""

    def setUp(self):
        self.marca = Marca.objects.create(nombre='Maison Casos')
        self.reloj = Reloj.objects.create(
            nombre='Référence Casos', marca=self.marca, precio='8000.00', stock=5,
            diametro_caja_mm='40.0', descripcion='Reloj de prueba',
        )
        self.url = '/api/pedidos/checkout/'

    def base_payload(self, **overrides):
        payload = {
            'cliente_nombre': 'Cliente Casos', 'cliente_email': 'casos@example.com',
            'cliente_telefono': '+51123456789', 'direccion_envio': 'Av. Lima 10',
            'garantia_aceptada': True,
            'items': [{'reloj_id': self.reloj.id, 'cantidad': 1}],
        }
        payload.update(overrides)
        return payload

    def assert_rechazado_sin_efectos(self, payload, estado_esperado):
        ordenes_antes = Orden.objects.count()
        stock_antes = Reloj.objects.get(pk=self.reloj.pk).stock
        response = self.client.post(self.url, payload, format='json')
        self.assertIn(
            response.status_code, (estado_esperado,) if isinstance(estado_esperado, int) else estado_esperado,
            f'Payload {payload} devolvió {response.status_code}: {getattr(response, "data", None)}',
        )
        self.assertEqual(Orden.objects.count(), ordenes_antes, 'No debe crearse orden si la validación falla.')
        self.assertEqual(Reloj.objects.get(pk=self.reloj.pk).stock, stock_antes, 'No debe descontarse stock si el checkout falla.')

    def test_id_reloj_invalido(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[{'reloj_id': 'no-numerico', 'cantidad': 1}]), 400)

    def test_cantidad_invalida(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[{'reloj_id': self.reloj.id, 'cantidad': 'mucha'}]), 400)

    def test_cantidad_cero(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[{'reloj_id': self.reloj.id, 'cantidad': 0}]), 400)

    def test_cantidad_negativa(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[{'reloj_id': self.reloj.id, 'cantidad': -2}]), 400)

    def test_cantidad_superior_al_limite(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[{'reloj_id': self.reloj.id, 'cantidad': 51}]), 400)

    def test_ids_duplicados_dentro_de_limite_consolidan(self):
        ordenes_antes = Orden.objects.count()
        payload = self.base_payload(items=[
            {'reloj_id': self.reloj.id, 'cantidad': 1},
            {'reloj_id': self.reloj.id, 'cantidad': 2},
        ])
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Orden.objects.count(), ordenes_antes + 1)
        self.assertEqual(Reloj.objects.get(pk=self.reloj.pk).stock, 2)

    def test_ids_duplicados_que_exceden_limite_rechazados(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[
                {'reloj_id': self.reloj.id, 'cantidad': 30},
                {'reloj_id': self.reloj.id, 'cantidad': 30},
            ]), 400)

    def test_correo_invalido(self):
        self.assert_rechazado_sin_efectos(self.base_payload(cliente_email='no-es-correo'), 400)

    def test_producto_inexistente(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[{'reloj_id': 999999, 'cantidad': 1}]), 404)

    def test_stock_insuficiente(self):
        self.assert_rechazado_sin_efectos(
            self.base_payload(items=[{'reloj_id': self.reloj.id, 'cantidad': 50}]), 400)

    def test_garantia_no_aceptada(self):
        self.assert_rechazado_sin_efectos(self.base_payload(garantia_aceptada=False), 400)
        payload = self.base_payload()
        del payload['garantia_aceptada']
        self.assert_rechazado_sin_efectos(payload, 400)

    def test_validar_carrito_rechaza_cantidad_consolidada_fuera_de_limite(self):
        response = self.client.post('/api/pedidos/carrito/validar/', {
            'items': [
                {'reloj_id': self.reloj.id, 'cantidad': 30},
                {'reloj_id': self.reloj.id, 'cantidad': 30},
            ],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LegacyCheckoutValidationTests(TestCase):
    """Cierre de riesgos: checkout legacy valida correo/garantía y solo muta por POST."""

    def setUp(self):
        self.marca = Marca.objects.create(nombre='Maison Legacy')
        self.reloj = Reloj.objects.create(
            nombre='Référence Legacy', marca=self.marca, precio='7000.00', stock=5,
            diametro_caja_mm='38.0', descripcion='Reloj de prueba legacy',
        )
        session = self.client.session
        session['carrito'] = {str(self.reloj.id): 1}
        session.save()

    def payload(self, **overrides):
        data = {
            'nombre': 'Cliente Legacy',
            'email': 'legacy@example.com',
            'telefono': '+51123456789',
            'direccion': 'Av. Lima 10',
            'ciudad': 'Lima',
            'notas': '',
            'garantia_aceptada': '1',
        }
        data.update(overrides)
        return data

    def cart_session(self):
        return dict(self.client.session.get('carrito', {}))

    def test_checkout_requires_guarantee_and_persists_it(self):
        response = self.client.post(reverse('pedidos:checkout'), self.payload(garantia_aceptada=''))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Orden.objects.exists())
        self.assertEqual(Reloj.objects.get(pk=self.reloj.pk).stock, 5)

        response = self.client.post(reverse('pedidos:checkout'), self.payload())
        self.assertEqual(response.status_code, 302)
        orden = Orden.objects.get()
        self.assertTrue(orden.garantia_aceptada)
        self.assertEqual(orden.estado, Orden.EstadoOrden.SOLICITADA)
        self.assertEqual(Reloj.objects.get(pk=self.reloj.pk).stock, 4)
        self.assertEqual(self.cart_session(), {})

    def test_checkout_rejects_invalid_email_without_creating_order(self):
        response = self.client.post(reverse('pedidos:checkout'), self.payload(email='no-es-correo'))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Orden.objects.exists())
        self.assertEqual(Reloj.objects.get(pk=self.reloj.pk).stock, 5)
        self.assertEqual(self.cart_session(), {str(self.reloj.id): 1})

    def test_cart_mutations_reject_get_and_keep_session_state(self):
        add_url = reverse('pedidos:agregar_carrito', args=[self.reloj.id])
        update_url = reverse('pedidos:actualizar_cantidad', args=[self.reloj.id])
        remove_url = reverse('pedidos:eliminar_carrito', args=[self.reloj.id])

        self.assertEqual(self.client.get(add_url).status_code, 405)
        self.assertEqual(self.client.get(f'{update_url}?accion=incrementar').status_code, 405)
        self.assertEqual(self.client.get(remove_url).status_code, 405)
        self.assertEqual(self.client.get(reverse('pedidos:vaciar_carrito')).status_code, 405)
        self.assertEqual(self.cart_session(), {str(self.reloj.id): 1})

        self.assertEqual(self.client.get(reverse('pedidos:obtener_carrito_json')).status_code, 200)
        self.assertEqual(self.client.post(reverse('pedidos:obtener_carrito_json')).status_code, 405)
