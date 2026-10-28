from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from catalogo.models import Marca, Reloj
from pedidos.models import Orden
from .models import Direccion, Perfil

User = get_user_model()

PAYMENT_TEST_SETTINGS = {
    'MERCADOPAGO_ACCESS_TOKEN': 'TEST-only-token',
    'MERCADOPAGO_WEBHOOK_SECRET': 'test-webhook-secret',
    'MERCADOPAGO_WEBHOOK_URL': 'https://shop.example.test/api/pedidos/webhooks/mercadopago/',
    'MERCADOPAGO_RETURN_BASE_URL': 'https://shop.example.test',
    'MERCADOPAGO_USD_PEN_RATE': '3.75',
    'MERCADOPAGO_RESERVATION_MINUTES': 30,
}


@override_settings(**PAYMENT_TEST_SETTINGS)
class CuentaApiTests(APITestCase):
    password = 'CronosGeneve!9274'

    def setUp(self):
        self.user = User.objects.create_user(username='cliente', email='cliente@example.com', password=self.password)
        self.other = User.objects.create_user(username='otro', email='otro@example.com', password=self.password)
        self.marca = Marca.objects.create(nombre='Maison Test')
        self.reloj = Reloj.objects.create(
            nombre='Référence 01', marca=self.marca, precio='12500.00', stock=5,
            diametro_caja_mm='40.0', descripcion='Reloj de prueba',
        )

    def auth_as(self, user=None):
        self.client.force_authenticate(user=user or self.user)

    def address_payload(self, **overrides):
        return {
            'etiqueta': 'Casa', 'destinatario': 'Cliente Cronos', 'telefono': '+51123456789',
            'direccion': 'Avenida del Tiempo 123', 'ciudad': 'Lima', 'region': 'Lima',
            'codigo_postal': '15000', 'pais': 'Perú', 'es_predeterminada': True, **overrides,
        }

    def order_for(self, user):
        return Orden.objects.create(
            usuario=user, cliente_nombre=user.username, cliente_email=user.email,
            cliente_telefono='+51123456789', direccion_envio='Dirección de prueba',
        )

    def test_register_validates_duplicate_username_password_and_never_returns_password(self):
        payload = {
            'username': 'nuevo', 'email': 'nuevo@example.com',
            'password': self.password, 'password_confirm': self.password,
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('password', response.data)
        self.assertTrue(Perfil.objects.filter(usuario__username='nuevo').exists())
        self.assertEqual(self.client.post('/api/auth/register/', payload, format='json').status_code, status.HTTP_400_BAD_REQUEST)
        payload['username'] = 'nuevo2'
        payload['password_confirm'] = 'different'
        self.assertEqual(self.client.post('/api/auth/register/', payload, format='json').status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_valid_invalid_and_me_requires_authentication(self):
        ok = self.client.post('/api/auth/login/', {'username': 'cliente', 'password': self.password}, format='json')
        self.assertEqual(ok.status_code, status.HTTP_200_OK)
        self.assertIn('access', ok.data)
        self.assertIn('refresh', ok.data)
        self.assertNotIn('password', ok.data['user'])
        bad = self.client.post('/api/auth/login/', {'username': 'cliente', 'password': 'wrong'}, format='json')
        self.assertEqual(bad.status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.credentials()
        self.assertEqual(self.client.get('/api/auth/me/').status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_and_logout_revoke_refresh_token(self):
        login = self.client.post('/api/auth/login/', {'username': 'cliente', 'password': self.password}, format='json')
        refreshed = self.client.post('/api/auth/refresh/', {'refresh': login.data['refresh']}, format='json')
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)
        self.assertIn('access', refreshed.data)
        self.assertIn('refresh', refreshed.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refreshed.data['access']}")
        logged_out = self.client.post('/api/auth/logout/', {'refresh': refreshed.data['refresh']}, format='json')
        self.assertEqual(logged_out.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertEqual(self.client.post('/api/auth/refresh/', {'refresh': refreshed.data['refresh']}, format='json').status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_works_without_valid_access_token(self):
        # Fase 2.1 §2 — el logout revoca por el valor del refresh, sin exigir access válido.
        login = self.client.post('/api/auth/login/', {'username': 'cliente', 'password': self.password}, format='json')
        refresh = login.data['refresh']
        self.client.credentials()
        logged_out = self.client.post('/api/auth/logout/', {'refresh': refresh}, format='json')
        self.assertEqual(logged_out.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertEqual(self.client.post('/api/auth/refresh/', {'refresh': refresh}, format='json').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.post('/api/auth/logout/', {'refresh': refresh}, format='json').status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.post('/api/auth/logout/', {}, format='json').status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_profile_and_addresses_are_scoped_to_current_user(self):
        self.auth_as()
        self.assertEqual(self.client.get('/api/auth/me/').data['id'], self.user.id)
        self.assertEqual(self.client.get('/api/perfil/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/perfil/5/').status_code, status.HTTP_404_NOT_FOUND)

        created = self.client.post('/api/direcciones/', self.address_payload(), format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        foreign = Direccion.objects.create(usuario=self.other, **self.address_payload(es_predeterminada=False))
        self.assertEqual(len(self.client.get('/api/direcciones/').data), 1)
        self.assertEqual(self.client.get(f'/api/direcciones/{foreign.id}/').status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.patch(f'/api/direcciones/{foreign.id}/', {'ciudad': 'Quito'}, format='json').status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.delete(f'/api/direcciones/{foreign.id}/').status_code, status.HTTP_404_NOT_FOUND)

    def test_favorites_are_unique_and_removable(self):
        self.auth_as()
        payload = {'reloj_id': self.reloj.id}
        self.assertEqual(self.client.post('/api/favoritos/', payload, format='json').status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.client.post('/api/favoritos/', payload, format='json').status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(len(self.client.get('/api/favoritos/').data), 1)
        self.assertEqual(self.client.delete(f'/api/favoritos/{self.reloj.id}/').status_code, status.HTTP_204_NO_CONTENT)

    def test_order_history_only_exposes_current_users_orders(self):
        own = self.order_for(self.user)
        foreign = self.order_for(self.other)
        self.auth_as()
        response = self.client.get('/api/me/ordenes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rows = response.data.get('results', response.data)
        ids = [item['id'] for item in rows]
        self.assertIn(own.id, ids)
        self.assertNotIn(foreign.id, ids)
        self.assertEqual(self.client.get(f'/api/me/ordenes/{own.id}/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(f'/api/me/ordenes/{foreign.id}/').status_code, status.HTTP_404_NOT_FOUND)

    @patch('pedidos.api_views.create_preference', return_value='https://sandbox.mercadopago.com/checkout/mock')
    def test_guest_and_authenticated_checkout_validate_terms_and_stock(self, create_preference_mock):
        payload = {
            'cliente_nombre': 'Cliente Invitado', 'cliente_email': 'invitado@example.com',
            'cliente_telefono': '+51123456789', 'direccion_envio': 'Av. Lima 10',
            'garantia_aceptada': True, 'items': [{'reloj_id': self.reloj.id, 'cantidad': 1}],
        }
        guest = self.client.post('/api/pedidos/checkout/', payload, format='json')
        self.assertEqual(guest.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(Orden.objects.get(pk=guest.data['orden']['id']).usuario_id)
        self.assertTrue(guest.data['token_acceso'])
        order_id = guest.data['orden']['id']
        self.assertEqual(self.client.get(f'/api/pedidos/ordenes/{order_id}/').status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.get(f"/api/pedidos/ordenes/{order_id}/?token={guest.data['token_acceso']}").status_code, status.HTTP_200_OK)
        self.assertEqual(self.reloj.__class__.objects.get(pk=self.reloj.id).stock, 4)

        self.auth_as()
        payload['cliente_nombre'] = self.user.username
        payload['cliente_email'] = self.user.email
        authenticated = self.client.post('/api/pedidos/checkout/', payload, format='json')
        self.assertEqual(authenticated.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('token_acceso', authenticated.data)
        self.assertNotIn('token_acceso', authenticated.data['orden'])
        self.assertEqual(Orden.objects.get(pk=authenticated.data['orden']['id']).usuario, self.user)

        no_guarantee = {**payload, 'garantia_aceptada': False}
        self.assertEqual(self.client.post('/api/pedidos/checkout/', no_guarantee, format='json').status_code, status.HTTP_400_BAD_REQUEST)
        no_stock = {**payload, 'items': [{'reloj_id': self.reloj.id, 'cantidad': 50}]}
        self.assertEqual(self.client.post('/api/pedidos/checkout/', no_stock, format='json').status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_gets_profile_with_creation_date_and_contact_info(self):
        self.auth_as()
        response = self.client.get('/api/perfil/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertIn('telefono', response.data)
        self.assertIn('creado_en', response.data)
        self.assertIn('date_joined', response.data)

    def test_user_updates_permitted_profile_fields(self):
        self.auth_as()
        payload = {
            'first_name': 'Carlos',
            'last_name': 'Mendoza',
            'telefono': '+51987654321',
            'email': 'hacker@example.com',
            'username': 'hackerman',
        }
        response = self.client.patch('/api/perfil/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Carlos')
        self.assertEqual(response.data['last_name'], 'Mendoza')
        self.assertEqual(response.data['telefono'], '+51987654321')
        # Email and username must remain unchanged
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['username'], self.user.username)

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Carlos')
        self.assertEqual(self.user.last_name, 'Mendoza')
        self.assertEqual(self.user.perfil.telefono, '+51987654321')
        self.assertEqual(self.user.email, 'cliente@example.com')
        self.assertEqual(self.user.username, 'cliente')

    def test_user_cannot_modify_another_user_profile(self):
        self.auth_as(self.user)
        # Endpoint /api/perfil/ operates solely on request.user
        self.client.patch('/api/perfil/', {'first_name': 'Atacante'}, format='json')
        self.other.refresh_from_db()
        self.assertNotEqual(self.other.first_name, 'Atacante')
        # Direct access with pk does not exist (404)
        self.assertEqual(self.client.patch(f'/api/perfil/{self.other.id}/', {'first_name': 'Atacante'}, format='json').status_code, status.HTTP_404_NOT_FOUND)

    def test_address_case_a_first_address_is_automatically_default(self):
        self.auth_as()
        self.assertFalse(Direccion.objects.filter(usuario=self.user).exists())
        # Even if explicit False is passed, the first address must be default
        payload = self.address_payload(es_predeterminada=False)
        response = self.client.post('/api/direcciones/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['es_predeterminada'])
        addr = Direccion.objects.get(pk=response.data['id'])
        self.assertTrue(addr.es_predeterminada)

    def test_user_edits_their_address(self):
        self.auth_as()
        addr = Direccion.objects.create(usuario=self.user, **self.address_payload())
        response = self.client.patch(f'/api/direcciones/{addr.id}/', {'ciudad': 'Cusco', 'etiqueta': 'Vacaciones'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['ciudad'], 'Cusco')
        self.assertEqual(response.data['etiqueta'], 'Vacaciones')
        addr.refresh_from_db()
        self.assertEqual(addr.ciudad, 'Cusco')
        self.assertEqual(addr.etiqueta, 'Vacaciones')

    def test_address_case_b_setting_default_unsets_others(self):
        self.auth_as()
        addr1 = Direccion.objects.create(usuario=self.user, **self.address_payload(etiqueta='Dir 1', es_predeterminada=True))
        addr2 = Direccion.objects.create(usuario=self.user, **self.address_payload(etiqueta='Dir 2', es_predeterminada=False))
        self.assertTrue(addr1.es_predeterminada)
        self.assertFalse(addr2.es_predeterminada)

        response = self.client.patch(f'/api/direcciones/{addr2.id}/', {'es_predeterminada': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['es_predeterminada'])

        addr1.refresh_from_db()
        addr2.refresh_from_db()
        self.assertFalse(addr1.es_predeterminada)
        self.assertTrue(addr2.es_predeterminada)

    def test_address_case_c_deleting_non_default_preserves_default(self):
        self.auth_as()
        addr1 = Direccion.objects.create(usuario=self.user, **self.address_payload(etiqueta='Principal', es_predeterminada=True))
        addr2 = Direccion.objects.create(usuario=self.user, **self.address_payload(etiqueta='Secundaria', es_predeterminada=False))

        response = self.client.delete(f'/api/direcciones/{addr2.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        addr1.refresh_from_db()
        self.assertTrue(addr1.es_predeterminada)
        self.assertEqual(Direccion.objects.filter(usuario=self.user).count(), 1)

    def test_address_case_d_deleting_default_promotes_another(self):
        self.auth_as()
        addr1 = Direccion.objects.create(usuario=self.user, **self.address_payload(etiqueta='Principal', es_predeterminada=True))
        addr2 = Direccion.objects.create(usuario=self.user, **self.address_payload(etiqueta='Secundaria', es_predeterminada=False))

        response = self.client.delete(f'/api/direcciones/{addr1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        addr2.refresh_from_db()
        self.assertTrue(addr2.es_predeterminada)
        self.assertEqual(Direccion.objects.filter(usuario=self.user, es_predeterminada=True).count(), 1)

    def test_address_case_e_deleting_only_address_leaves_zero(self):
        self.auth_as()
        addr = Direccion.objects.create(usuario=self.user, **self.address_payload(es_predeterminada=True))
        response = self.client.delete(f'/api/direcciones/{addr.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Direccion.objects.filter(usuario=self.user).count(), 0)

    def test_user_cannot_access_or_mutate_other_user_address(self):
        foreign = Direccion.objects.create(usuario=self.other, **self.address_payload(etiqueta='Ajena'))
        self.auth_as(self.user)
        self.assertEqual(self.client.get(f'/api/direcciones/{foreign.id}/').status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.patch(f'/api/direcciones/{foreign.id}/', {'etiqueta': 'Robada'}, format='json').status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.delete(f'/api/direcciones/{foreign.id}/').status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_requests_rejected_with_401(self):
        self.client.credentials()  # Desautenticar
        self.assertEqual(self.client.get('/api/perfil/').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.patch('/api/perfil/', {'telefono': '123'}, format='json').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get('/api/direcciones/').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.post('/api/direcciones/', self.address_payload(), format='json').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get('/api/direcciones/1/').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.patch('/api/direcciones/1/', {'ciudad': 'Lima'}, format='json').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.delete('/api/direcciones/1/').status_code, status.HTTP_401_UNAUTHORIZED)
