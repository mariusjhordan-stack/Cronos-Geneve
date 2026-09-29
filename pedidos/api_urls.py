from django.urls import path
from .api_views import CheckoutAPIView, OrdenDetailAPIView, CarritoSyncAPIView

app_name = 'pedidos_api'

urlpatterns = [
    path('checkout/', CheckoutAPIView.as_view(), name='api_checkout'),
    path('ordenes/<int:pk>/', OrdenDetailAPIView.as_view(), name='api_orden_detail'),
    path('carrito/', CarritoSyncAPIView.as_view(), name='api_carrito_sync'),
]
