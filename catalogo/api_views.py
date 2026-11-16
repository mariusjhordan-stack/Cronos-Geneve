from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.db.models import Q, Case, When, Value, IntegerField
from .models import Marca, Categoria, Reloj
from .serializers import (
    MarcaSerializer, CategoriaSerializer, RelojSerializer, RelojRecomendadoSerializer,
)


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
        if self.action in ('list', 'retrieve', 'recomendaciones'):
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

    @action(detail=True, methods=['get'], url_path='recomendaciones')
    def recomendaciones(self, request, pk=None):
        """
        GET /api/relojes/<id>/recomendaciones/
        Hasta 4 piezas de la misma casa (marca) o el mismo calibre (movimiento).

        Por qué un @action y no un filtro en /api/relojes/: la regla (excluir la
        pieza actual, puntuar, ordenar por disponibilidad, limitar a 4) vive en
        el servidor, es una sola consulta SQL y el cliente deja de descargar
        todo el catálogo para filtrarlo en JavaScript.
        """
        reloj = self.get_object()  # 404 si no existe

        misma_casa = Q(marca_id=reloj.marca_id)
        mismo_calibre = Q(movimiento=reloj.movimiento)

        piezas = (
            Reloj.objects.select_related('marca')
            .prefetch_related('categorias', 'imagenes')
            .exclude(pk=reloj.pk)
            .filter(misma_casa | mismo_calibre)
            .annotate(
                puntaje=Case(
                    When(misma_casa & mismo_calibre, then=Value(3)),
                    When(misma_casa, then=Value(2)),
                    When(mismo_calibre, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
                disponible=Case(
                    When(stock__gt=0, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
            )
            # Primero las disponibles, luego mayor afinidad; id desempata de forma estable.
            .order_by('-disponible', '-puntaje', '-creado_en', 'id')[:4]
        )
        serializer = RelojRecomendadoSerializer(piezas, many=True, context={'request': request})
        return Response(serializer.data)
