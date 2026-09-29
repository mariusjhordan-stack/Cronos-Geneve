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
            'ciudad',
            'pais',
            'estado',
            'estado_display',
            'total',
            'notas',
            'detalles',
            'creado_en',
            'actualizado_en',
        ]

    def get_codigo_orden(self, obj):
        return f"#CRONOS-{obj.id:05d}-2026"

    def get_numero_serie(self, obj):
        return f"CE-GENEVE-{obj.id:05d}-{obj.creado_en.strftime('%Y%m%d')}"
