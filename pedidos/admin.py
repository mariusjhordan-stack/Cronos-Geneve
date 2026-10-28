from django.contrib import admin
from .models import Orden, DetalleOrden, PagoMercadoPago


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
        'usuario',
        'ciudad',
        'estado',
        'estado_pago',
        'total_formateado',
        'creado_en',
    )
    list_filter = ('estado', 'estado_pago', 'creado_en', 'ciudad', 'usuario')
    search_fields = ('cliente_nombre', 'cliente_email', 'id')
    list_editable = ('estado',)
    inlines = [DetalleOrdenInline]
    readonly_fields = (
        'total', 'token_acceso', 'garantia_aceptada', 'creado_en', 'actualizado_en',
        'referencia_pago', 'clave_idempotencia', 'estado_pago', 'monto_pago', 'moneda_pago',
        'preferencia_pago_id', 'url_pago', 'pago_gateway_id', 'stock_reservado',
        'reserva_expira_en', 'conflicto_stock_pago', 'pago_actualizado_en',
    )

    def total_formateado(self, obj):
        return f"${obj.total:,.2f}"
    total_formateado.short_description = "Total (USD)"


@admin.register(DetalleOrden)
class DetalleOrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'orden', 'reloj', 'precio_unitario', 'cantidad', 'subtotal')
    list_filter = ('orden__estado',)
    search_fields = ('orden__cliente_nombre', 'reloj__nombre')


@admin.register(PagoMercadoPago)
class PagoMercadoPagoAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'orden', 'estado', 'monto', 'moneda', 'actualizado_en')
    list_filter = ('estado', 'moneda', 'actualizado_en')
    search_fields = ('payment_id', 'external_reference', 'orden__id')
    readonly_fields = ('orden', 'payment_id', 'estado', 'detalle_estado', 'monto', 'moneda', 'external_reference', 'creado_en', 'actualizado_en')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
