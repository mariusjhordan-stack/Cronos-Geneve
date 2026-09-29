from django.contrib import admin
from .models import Orden, DetalleOrden


class DetalleOrdenInline(admin.TabularInline):
    model = DetalleOrden
    extra = 1
    raw_id_fields = ('reloj',)
    readonly_fields = ('subtotal_display',)

    def subtotal_display(self, obj):
        if obj.id:
            return f"${obj.subtotal:,.2f}"
        return "$0.00"
    subtotal_display.short_description = "Subtotal"


@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'cliente_nombre',
        'cliente_email',
        'cliente_telefono',
        'ciudad',
        'estado',
        'total_formateado',
        'creado_en',
    )
    list_filter = ('estado', 'creado_en', 'ciudad')
    search_fields = ('cliente_nombre', 'cliente_email', 'id')
    list_editable = ('estado',)
    inlines = [DetalleOrdenInline]
    readonly_fields = ('total', 'creado_en', 'actualizado_en')

    def total_formateado(self, obj):
        return f"${obj.total:,.2f}"
    total_formateado.short_description = "Total (USD)"


@admin.register(DetalleOrden)
class DetalleOrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'orden', 'reloj', 'precio_unitario', 'cantidad', 'subtotal')
    list_filter = ('orden__estado',)
    search_fields = ('orden__cliente_nombre', 'reloj__nombre')
