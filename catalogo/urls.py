from django.urls import path
from . import views

app_name = 'catalogo'

urlpatterns = [
    path('', views.catalogo_index, name='index'),
    path('reloj/<int:pk>/', views.catalogo_detalle, name='detalle'),
    path('comparador/', views.comparador_relojes, name='comparador'),
]
