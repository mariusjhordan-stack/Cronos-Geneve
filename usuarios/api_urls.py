from django.urls import path

from .api_views import DireccionDetailAPIView, DireccionesAPIView, FavoritoDetailAPIView, FavoritosAPIView, PerfilAPIView

urlpatterns = [
    path('perfil/', PerfilAPIView.as_view(), name='api_perfil'),
    path('direcciones/', DireccionesAPIView.as_view(), name='api_direcciones'),
    path('direcciones/<int:pk>/', DireccionDetailAPIView.as_view(), name='api_direccion_detail'),
    path('favoritos/', FavoritosAPIView.as_view(), name='api_favoritos'),
    path('favoritos/<int:reloj_id>/', FavoritoDetailAPIView.as_view(), name='api_favorito_detail'),
]
