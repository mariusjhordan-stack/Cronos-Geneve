from django.urls import path
from . import views

app_name = 'pedidos'

urlpatterns = [
    # Carrito de Compras en Sesión
    path('carrito/agregar/<int:reloj_id>/', views.agregar_al_carrito, name='agregar_carrito'),
    path('carrito/actualizar/<int:reloj_id>/', views.actualizar_cantidad, name='actualizar_cantidad'),
    path('carrito/eliminar/<int:reloj_id>/', views.eliminar_del_carrito, name='eliminar_carrito'),
    path('carrito/vaciar/', views.vaciar_carrito, name='vaciar_carrito'),
    path('carrito/json/', views.obtener_carrito_json, name='obtener_carrito_json'),

    # Proceso de Adquisición Multiproducto y Certificado
    path('checkout/', views.checkout, name='checkout'),
    path('confirmacion/<int:orden_id>/', views.pedido_confirmacion, name='confirmacion'),
]
