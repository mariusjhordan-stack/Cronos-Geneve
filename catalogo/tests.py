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
