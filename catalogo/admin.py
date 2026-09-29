from django.contrib import admin
from .models import Marca, Categoria, Reloj


@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'pais_origen', 'sitio_web', 'total_relojes', 'creado_en')
    search_fields = ('nombre', 'pais_origen')
    list_filter = ('pais_origen',)

    def total_relojes(self, obj):
        return obj.relojes.count()
    total_relojes.short_description = "Relojes en Catálogo"


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'slug', 'total_relojes')
    prepopulated_fields = {'slug': ('nombre',)}
    search_fields = ('nombre',)

    def total_relojes(self, obj):
        return obj.relojes.count()
    total_relojes.short_description = "Modelos Asociados"


@admin.register(Reloj)
class RelojAdmin(admin.ModelAdmin):
    # Personalización requerida: list_display, list_filter, search_fields y list_editable
    list_display = (
        'nombre',
        'marca',
        'movimiento',
        'precio',
        'stock',
        'diametro_caja_mm',
        'resistencia_agua_m',
        'en_stock_badge',
        'creado_en',
    )
    list_filter = (
        'marca',
        'movimiento',
        'categorias',
        'creado_en',
    )
    search_fields = (
        'nombre',
        'marca__nombre',
        'descripcion',
        'material_correa',
    )
    list_editable = (
        'precio',
        'stock',
    )
    list_per_page = 15
    filter_horizontal = ('categorias',)
    readonly_fields = ('creado_en',)

    fieldsets = (
        ('Información Comercial', {
            'fields': ('nombre', 'marca', 'categorias', 'precio', 'stock', 'imagen_url')
        }),
        ('Especificaciones Horológicas', {
            'fields': (
                'movimiento',
                'diametro_caja_mm',
                'cristal',
                'resistencia_agua_m',
                'material_correa',
            )
        }),
        ('Detalles y Registro', {
            'classes': ('collapse',),
            'fields': ('descripcion', 'creado_en')
        }),
    )

    def en_stock_badge(self, obj):
        return obj.stock > 0
    en_stock_badge.boolean = True
    en_stock_badge.short_description = "¿Disponible?"
