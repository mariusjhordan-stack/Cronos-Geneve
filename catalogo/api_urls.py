from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import RelojViewSet, MarcaViewSet, CategoriaViewSet

router = DefaultRouter()
router.register(r'relojes', RelojViewSet, basename='api-reloj')
router.register(r'marcas', MarcaViewSet, basename='api-marca')
router.register(r'categorias', CategoriaViewSet, basename='api-categoria')

urlpatterns = [
    path('', include(router.urls)),
]
