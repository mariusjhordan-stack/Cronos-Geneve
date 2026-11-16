from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Categoria, Marca, Reloj

User = get_user_model()


class CatalogPermissionsTests(APITestCase):
    def setUp(self):
        self.marca = Marca.objects.create(nombre='Maison Test')
        self.reloj = Reloj.objects.create(
            nombre='Référence 01', marca=self.marca, precio='12500.00', stock=5,
            diametro_caja_mm='40.0', descripcion='Reloj de prueba',
        )

    def test_catalog_and_taxonomies_are_public_read_only_for_customers(self):
        self.assertEqual(self.client.get('/api/relojes/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(f'/api/relojes/{self.reloj.id}/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/marcas/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/categorias/').status_code, status.HTTP_200_OK)

        customer = User.objects.create_user(username='cliente', password='CronosGeneve!9274')
        self.client.force_authenticate(customer)
        self.assertEqual(self.client.patch(f'/api/relojes/{self.reloj.id}/', {'stock': 99}, format='json').status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.post('/api/marcas/', {'nombre': 'No autorizada'}, format='json').status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.post('/api/categorias/', {'nombre': 'No autorizada'}, format='json').status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_can_write_catalog(self):
        admin = User.objects.create_user(username='staff', password='CronosGeneve!9274', is_staff=True)
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.patch(f'/api/relojes/{self.reloj.id}/', {'stock': 8}, format='json').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/api/marcas/', {'nombre': 'Maison Admin'}, format='json').status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.client.post('/api/categorias/', {'nombre': 'Complicaciones'}, format='json').status_code, status.HTTP_201_CREATED)


class ImagenRelojGalleryTests(APITestCase):
    def setUp(self):
        self.marca = Marca.objects.create(nombre='Maison Horlogère')
        self.reloj = Reloj.objects.create(
            nombre='Chronographe Royal',
            marca=self.marca,
            precio='25000.00',
            stock=3,
            diametro_caja_mm='41.0',
            descripcion='Pieza con galería de alta manufactura.',
            imagen_url='/images/relojes/placeholder-reloj.svg'
        )
        from .models import ImagenReloj
        self.img1 = ImagenReloj.objects.create(
            reloj=self.reloj,
            url='https://example.com/reloj-frontal.jpg',
            orden=1,
            alt_text='Vista Frontal Esfera'
        )
        self.img2 = ImagenReloj.objects.create(
            reloj=self.reloj,
            url='https://example.com/reloj-perfil.jpg',
            orden=2,
            alt_text='Vista Perfil Caja'
        )

    def test_reloj_detail_exposes_gallery_images(self):
        response = self.client.get(f'/api/relojes/{self.reloj.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('imagenes', data)
        self.assertEqual(len(data['imagenes']), 2)
        self.assertEqual(data['imagenes'][0]['orden'], 1)
        self.assertEqual(data['imagenes'][0]['url'], 'https://example.com/reloj-frontal.jpg')
        self.assertEqual(data['imagenes'][0]['alt_text'], 'Vista Frontal Esfera')
        self.assertEqual(data['imagenes'][1]['orden'], 2)
        self.assertEqual(data['imagenes'][1]['url'], 'https://example.com/reloj-perfil.jpg')

        # imagen_url debe reflejar la imagen principal de la galería
        self.assertEqual(data['imagen_url'], 'https://example.com/reloj-frontal.jpg')

    def test_imagen_reloj_cascade_deletion(self):
        from .models import ImagenReloj
        reloj_id = self.reloj.id
        self.assertEqual(ImagenReloj.objects.filter(reloj_id=reloj_id).count(), 2)
        self.reloj.delete()
        self.assertEqual(ImagenReloj.objects.filter(reloj_id=reloj_id).count(), 0)


class RecomendacionesTests(APITestCase):
    def _reloj(self, nombre, marca, movimiento='AUTOMATICO', stock=3):
        return Reloj.objects.create(
            nombre=nombre, marca=marca, precio='1000.00', stock=stock,
            movimiento=movimiento, diametro_caja_mm='40.0', descripcion='x',
        )

    def test_excluye_actual_ordena_por_disponibilidad_y_puntaje_y_limita_a_4(self):
        a, b = Marca.objects.create(nombre='Casa A'), Marca.objects.create(nombre='Casa B')
        base = self._reloj('Base', a, 'AUTOMATICO')
        casa_calibre = self._reloj('CasaCalibre', a, 'AUTOMATICO')
        casa = self._reloj('Casa', a, 'CUARZO')
        calibre = self._reloj('Calibre', b, 'AUTOMATICO')
        agotada = self._reloj('Agotada', a, 'AUTOMATICO', stock=0)
        self._reloj('Otra', b, 'CUARZO')  # sin relación: no debe aparecer
        extra = self._reloj('Extra', b, 'AUTOMATICO')

        r = self.client.get(f'/api/relojes/{base.id}/recomendaciones/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        nombres = [x['nombre'] for x in r.json()]
        self.assertEqual(len(nombres), 4)
        self.assertNotIn('Base', nombres)
        self.assertNotIn('Otra', nombres)
        self.assertNotIn('Agotada', nombres)  # las agotadas van al final y el tope es 4
        self.assertEqual(nombres[0], 'CasaCalibre')
        self.assertEqual(nombres[1], 'Casa')
        self.assertEqual(r.json()[0]['motivo'], 'casa_calibre')
        self.assertEqual(r.json()[1]['motivo'], 'casa')

    def test_404_si_no_existe(self):
        self.assertEqual(self.client.get('/api/relojes/9999/recomendaciones/').status_code, 404)


class ImagenPrincipalYSincronizacionTests(APITestCase):
    def setUp(self):
        from .models import ImagenReloj
        self.ImagenReloj = ImagenReloj
        self.marca = Marca.objects.create(nombre='Casa Imagen')
        self.reloj = Reloj.objects.create(
            nombre='Pieza', marca=self.marca, precio='1000.00', stock=1,
            diametro_caja_mm='40.0', descripcion='x', imagen_url='/images/relojes/placeholder-reloj.svg',
        )

    def test_imagen_url_prefiere_la_marcada_como_principal_y_expone_tipo_y_card(self):
        self.ImagenReloj.objects.create(reloj=self.reloj, url='/images/relojes/p/detalle.webp', orden=1, tipo='DETALLE')
        self.ImagenReloj.objects.create(
            reloj=self.reloj, url='/images/relojes/p/principal.webp', url_card='/images/relojes/p/principal-card.webp',
            orden=2, es_principal=True, tipo='PRODUCTO',
        )
        data = self.client.get(f'/api/relojes/{self.reloj.id}/').json()
        self.assertEqual(data['imagen_url'], '/images/relojes/p/principal.webp')
        principal = next(i for i in data['imagenes'] if i['es_principal'])
        self.assertEqual(principal['url_card'], '/images/relojes/p/principal-card.webp')
        detalle = next(i for i in data['imagenes'] if not i['es_principal'])
        self.assertEqual(detalle['url_card'], detalle['url'])  # sin miniatura -> imagen completa
        self.assertEqual(detalle['tipo'], 'DETALLE')

    def test_solo_una_imagen_principal_por_reloj(self):
        from django.db import IntegrityError, transaction
        self.ImagenReloj.objects.create(reloj=self.reloj, url='/a.webp', orden=1, es_principal=True)
        with self.assertRaises(IntegrityError), transaction.atomic():
            self.ImagenReloj.objects.create(reloj=self.reloj, url='/b.webp', orden=2, es_principal=True)

    def test_validador_rechaza_formatos_y_esquemas_no_permitidos(self):
        from django.core.exceptions import ValidationError
        from .models import validar_url_imagen
        validar_url_imagen('/images/relojes/x/principal.webp')
        validar_url_imagen('https://cdn.example.com/a.jpg?v=2')
        for malo in ('/images/x.gif', 'javascript:alert(1)', 'ftp://x/a.png', 'imagen.webp'):
            with self.assertRaises(ValidationError):
                validar_url_imagen(malo)

    def test_sincronizar_es_idempotente_y_retira_galerias_externas(self):
        import json, tempfile
        from pathlib import Path
        from .management.commands.sincronizar_imagenes import sincronizar
        self.ImagenReloj.objects.create(reloj=self.reloj, url='https://encrypted-tbn0.gstatic.com/x.jpg', orden=1, es_principal=True)
        self.ImagenReloj.objects.create(reloj=self.reloj, url='https://encrypted-tbn0.gstatic.com/y.jpg', orden=2)
        self.ImagenReloj.objects.create(reloj=self.reloj, url='https://otra.com/z.jpg', orden=3)
        manifest = {'slug': {'reloj': 'Pieza', 'marca': 'Casa Imagen', 'imagenes': [
            {'orden': 1, 'es_principal': True, 'tipo': 'ILUSTRACION', 'url': '/images/relojes/slug/principal.svg', 'url_card': '', 'alt_text': 'a'},
            {'orden': 2, 'es_principal': False, 'tipo': 'DETALLE', 'url': '/images/relojes/slug/detalle.webp', 'url_card': '/images/relojes/slug/detalle-card.webp', 'alt_text': 'b'},
        ]}}
        with tempfile.TemporaryDirectory() as tmp:
            ruta = Path(tmp) / 'manifest.json'
            ruta.write_text(json.dumps(manifest), encoding='utf-8')
            primero = sincronizar(ruta)
            segundo = sincronizar(ruta)
        self.assertEqual(primero['retiradas'], 1)
        self.assertEqual(segundo['retiradas'], 0)
        self.assertEqual(self.ImagenReloj.objects.filter(reloj=self.reloj).count(), 2)
        self.reloj.refresh_from_db()
        self.assertEqual(self.reloj.imagen_url, '/images/relojes/slug/principal.svg')
