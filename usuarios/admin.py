from django.contrib import admin

from .models import Direccion, Favorito, Perfil


@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'telefono', 'creado_en', 'actualizado_en')
    search_fields = ('usuario__username', 'usuario__email', 'telefono')


@admin.register(Direccion)
class DireccionAdmin(admin.ModelAdmin):
    list_display = ('etiqueta', 'destinatario', 'usuario', 'ciudad', 'pais', 'es_predeterminada')
    list_filter = ('pais', 'es_predeterminada')
    search_fields = ('destinatario', 'usuario__username', 'direccion', 'ciudad')


@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'reloj', 'creado_en')
    search_fields = ('usuario__username', 'reloj__nombre', 'reloj__marca__nombre')
