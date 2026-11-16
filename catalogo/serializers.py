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
    url_card = serializers.SerializerMethodField()

    class Meta:
        model = ImagenReloj
        fields = ['id', 'url', 'url_card', 'orden', 'es_principal', 'tipo', 'alt_text']

    def get_url_card(self, obj):
        # Sin miniatura propia se reutiliza la imagen completa: el frontend nunca recibe un campo vacío.
        return obj.url_card or obj.url


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
        # Principal = la marcada es_principal; si ninguna lo está, la de menor orden.
        # Se recorre la lista prefetcheada (sin consultas extra por reloj).
        imgs = list(obj.imagenes.all())
        principal = next((i for i in imgs if i.es_principal), imgs[0] if imgs else None)
        return principal.url if principal else obj.imagen_url


class RelojRecomendadoSerializer(RelojSerializer):
    """
    Igual que RelojSerializer pero añade `motivo`, derivado del puntaje que la
    vista anotó en la consulta (así no se recalcula en Python ni se duplica la regla).
    """
    MOTIVOS = {3: 'casa_calibre', 2: 'casa', 1: 'calibre'}
    motivo = serializers.SerializerMethodField()

    class Meta(RelojSerializer.Meta):
        fields = RelojSerializer.Meta.fields + ['motivo']

    def get_motivo(self, obj):
        return self.MOTIVOS.get(getattr(obj, 'puntaje', 0), '')
