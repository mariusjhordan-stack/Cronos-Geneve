from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers
from .models import Orden, DetalleOrden
from catalogo.serializers import RelojSerializer


class DetalleOrdenSerializer(serializers.ModelSerializer):
    reloj_detalle = RelojSerializer(source='reloj', read_only=True)
    reloj_nombre = serializers.ReadOnlyField(source='reloj.nombre')
    reloj_marca = serializers.ReadOnlyField(source='reloj.marca.nombre')
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = DetalleOrden
        fields = [
            'id',
            'reloj',
            'reloj_nombre',
            'reloj_marca',
            'reloj_detalle',
            'precio_unitario',
            'cantidad',
            'subtotal',
        ]


class OrdenSerializer(serializers.ModelSerializer):
    detalles = DetalleOrdenSerializer(many=True, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    codigo_orden = serializers.SerializerMethodField()
    numero_serie = serializers.SerializerMethodField()
    direccion_completa = serializers.SerializerMethodField()
    garantia_display = serializers.SerializerMethodField()
    estado_pago_display = serializers.CharField(source='get_estado_pago_display', read_only=True)
    pago = serializers.SerializerMethodField()
    linea_tiempo = serializers.SerializerMethodField()

    class Meta:
        model = Orden
        fields = [
            'id',
            'codigo_orden',
            'numero_serie',
            'cliente_nombre',
            'cliente_email',
            'cliente_telefono',
            'direccion_envio',
            'direccion_completa',
            'ciudad',
            'pais',
            'estado',
            'estado_display',
            'total',
            'estado_pago',
            'estado_pago_display',
            'pago',
            'linea_tiempo',
            'monto_pago',
            'moneda_pago',
            'notas',
            'garantia_aceptada',
            'garantia_display',
            'detalles',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = ['garantia_aceptada']

    def get_codigo_orden(self, obj):
        return f"#CRONOS-{obj.id:05d}-2026"

    def get_numero_serie(self, obj):
        return f"CE-GENEVE-{obj.id:05d}-{obj.creado_en.strftime('%Y%m%d')}"

    # --- Campos derivados para el comprobante -------------------------------
    # Se calculan en el servidor para que pantalla y PDF muestren exactamente
    # lo mismo y el cliente no tenga que reconstruir reglas de negocio.

    def get_direccion_completa(self, obj):
        """Dirección normalizada: calle + ciudad + país, sin repetir lo que ya contiene la calle."""
        base = ' '.join((obj.direccion_envio or '').split())
        partes = [base] if base else []
        for extra in (obj.ciudad, obj.pais):
            extra = (extra or '').strip()
            if extra and extra.lower() not in base.lower():
                partes.append(extra)
        return ', '.join(partes)

    def get_garantia_display(self, obj):
        return 'Garantía aceptada' if obj.garantia_aceptada else 'Garantía no registrada'

    def _pago_principal(self, obj):
        # .all() reutiliza el prefetch_related('pagos_gateway') si existe (evita N+1).
        pagos = list(obj.pagos_gateway.all())
        aprobados = [p for p in pagos if p.estado == obj.EstadoPago.APROBADO]
        elegidos = aprobados or pagos
        return max(elegidos, key=lambda p: p.actualizado_en) if elegidos else None

    def get_pago(self, obj):
        pago = self._pago_principal(obj)
        tipo_cambio = None
        if obj.monto_pago and obj.total:
            tipo_cambio = str((obj.monto_pago / obj.total).quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP))
        return {
            'proveedor': 'Mercado Pago',
            'operacion': pago.payment_id if pago else None,
            'estado': obj.estado_pago,
            'estado_display': obj.get_estado_pago_display(),
            'monto': str(obj.monto_pago) if obj.monto_pago is not None else None,
            'moneda': obj.moneda_pago or None,
            'tipo_cambio': tipo_cambio,
            'fecha': obj.pago_actualizado_en,
        }

    def get_linea_tiempo(self, obj):
        rango = {
            'SOLICITADA': 0, 'PENDIENTE': 0, 'PAGADO': 1,
            'EN_PREPARACION': 2, 'ENVIADO': 3, 'ENTREGADO': 4,
        }.get(obj.estado, 0)
        pagado = obj.estado_pago == obj.EstadoPago.APROBADO
        if pagado:
            rango = max(rango, 1)
        pasos = [
            ('registrada', 'Orden registrada', obj.creado_en),
            ('pagada', 'Pago confirmado', obj.pago_actualizado_en if pagado else None),
            ('preparacion', 'En preparación', None),
            ('enviada', 'Enviada', None),
            ('entregada', 'Entregada', None),
        ]
        linea = [
            {'clave': clave, 'etiqueta': etiqueta, 'completado': i <= rango, 'fecha': fecha}
            for i, (clave, etiqueta, fecha) in enumerate(pasos)
        ]
        if obj.estado == obj.EstadoOrden.CANCELADO:
            linea.append({'clave': 'cancelada', 'etiqueta': 'Orden cancelada', 'completado': True, 'fecha': obj.actualizado_en})
        return linea
