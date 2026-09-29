from rest_framework import viewsets, filters
from django.db.models import Q
from .models import Marca, Categoria, Reloj
from .serializers import MarcaSerializer, CategoriaSerializer, RelojSerializer


class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar las categorías horológicas.
    GET /api/categorias/
    GET /api/categorias/<id>/
    """
    queryset = Categoria.objects.all().order_by('nombre')
    serializer_class = CategoriaSerializer


class MarcaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar las manufacturas y marcas.
    GET /api/marcas/
    GET /api/marcas/<id>/
    """
    queryset = Marca.objects.all().order_by('nombre')
    serializer_class = MarcaSerializer


class RelojViewSet(viewsets.ModelViewSet):
    """
    API endpoint completo para operaciones CRUD en el catálogo de relojes.
    GET /api/relojes/ - Lista paginada con filtros
    POST /api/relojes/ - Creación de nueva pieza
    GET /api/relojes/<id>/ - Detalle de un reloj
    PUT /api/relojes/<id>/ - Actualización total
    PATCH /api/relojes/<id>/ - Actualización parcial (ej: actualizar stock)
    DELETE /api/relojes/<id>/ - Eliminación
    """
    queryset = Reloj.objects.select_related('marca').prefetch_related('categorias').all().order_by('-creado_en')
    serializer_class = RelojSerializer

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
