from django.urls import path

from .api_views import MiOrdenDetailAPIView, MisOrdenesAPIView

urlpatterns = [
    path('ordenes/', MisOrdenesAPIView.as_view(), name='api_mis_ordenes'),
    path('ordenes/<int:pk>/', MiOrdenDetailAPIView.as_view(), name='api_mi_orden_detail'),
]
