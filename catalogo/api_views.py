from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from django.db.models import Q
from .models import Marca, Categoria, Reloj
from .serializers import MarcaSerializer, CategoriaSerializer, RelojSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para consultar las categorías horológicas.
    GET /api/categorias/
    GET /api/categorias/<id>/
    """
    queryset = Categoria.objects.all().order_by('nombre')
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminUser()]


class MarcaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para consultar las manufacturas y marcas.
    GET /api/marcas/
    GET /api/marcas/<id>/
    """
    queryset = Marca.objects.all().order_by('nombre')
    serializer_class = MarcaSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminUser()]


class RelojViewSet(viewsets.ModelViewSet):
    """
    API endpoint del catálogo de relojes.
    GET /api/relojes/ - Lista paginada con filtros (público)
    GET /api/relojes/<id>/ - Detalle de un reloj (público)
    POST/PUT/PATCH/DELETE - Solo personal de administración (IsAdminUser).
    La administración principal se realiza vía Django Admin.
    """
    queryset = Reloj.objects.select_related('marca').prefetch_related('categorias', 'imagenes').all().order_by('-creado_en')
    serializer_class = RelojSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        marca_id = self.request.query_params.get('marca')
        movimiento = self.request.query_params.get('movimiento')
        categoria_id = self.request.query_params.get('categoria')
        buscar = self.request.query_params.get('buscar') or self.request.query_params.get('q')
        orden = self.request.query_params.get('orden')

        if marca_id:
            queryset = queryset.filter(marca_id=marca_id)

        if movimiento:
            queryset = queryset.filter(movimiento=movimiento)

        if categoria_id:
            queryset = queryset.filter(categorias__id=categoria_id)

        if buscar:
            queryset = queryset.filter(
                Q(nombre__icontains=buscar) |
                Q(marca__nombre__icontains=buscar) |
                Q(descripcion__icontains=buscar) |
                Q(material_correa__icontains=buscar)
            ).distinct()

        # Mapeo de opciones de ordenamiento amigables y técnicas
        orden_map = {
            'precio': 'precio',
            '-precio': '-precio',
            'precio_asc': 'precio',
            'precio_desc': '-precio',
            'nombre': 'nombre',
            'nombre_asc': 'nombre',
            'novedades': '-creado_en',
            '-creado_en': '-creado_en',
        }

        if orden and orden in orden_map:
            queryset = queryset.order_by(orden_map[orden])

        return queryset
