from rest_framework import serializers
from .models import Marca, Categoria, Reloj, ImagenReloj


class MarcaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Marca.
    Expone la información básica y el conteo de relojes.
    """
    total_modelos = serializers.IntegerField(source='relojes.count', read_only=True)

    class Meta:
        model = Marca
        fields = [
            'id',
            'nombre',
            'pais_origen',
            'sitio_web',
            'descripcion',
            'total_modelos',
            'creado_en',
        ]


class CategoriaSerializer(serializers.ModelSerializer):
    """
    Serializador para las categorías horológicas.
    """
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'slug', 'descripcion']


class ImagenRelojSerializer(serializers.ModelSerializer):
    """
    Serializador para las imágenes de la galería de cada reloj.
    """
    class Meta:
        model = ImagenReloj
        fields = ['id', 'url', 'orden', 'alt_text']


class RelojSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el catálogo de relojes.
    Optimizado para frontend desacoplado (React/Vite/Next.js).
    """
    marca_detalle = MarcaSerializer(source='marca', read_only=True)
    marca_nombre = serializers.ReadOnlyField(source='marca.nombre')
    categorias_detalle = CategoriaSerializer(source='categorias', many=True, read_only=True)
    movimiento_display = serializers.CharField(source='get_movimiento_display', read_only=True)
    en_stock = serializers.BooleanField(read_only=True)
    imagenes = ImagenRelojSerializer(many=True, read_only=True)
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Reloj
        fields = [
            'id',
            'nombre',
            'marca',
            'marca_nombre',
            'marca_detalle',
            'categorias',
            'categorias_detalle',
            'precio',
            'stock',
            'en_stock',
            'movimiento',
            'movimiento_display',
            'diametro_caja_mm',
            'cristal',
            'resistencia_agua_m',
            'material_correa',
            'descripcion',
            'imagen_url',
            'imagenes',
            'creado_en',
        ]

    def get_imagen_url(self, obj):
        # Si tiene imágenes en galería, la primera (orden 1) es la principal
        imgs = obj.imagenes.all()
        if imgs:
            return imgs[0].url
        return obj.imagen_url
