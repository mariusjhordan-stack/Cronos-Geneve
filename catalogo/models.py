from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils.text import slugify


class Marca(models.Model):
    """
    Entidad que representa las manufacturas y marcas relojeras de prestigio.
    Ejemplo: Rolex, Omega, Patek Philippe, Audemars Piguet, Seiko, Tag Heuer.
    """
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la Marca")
    pais_origen = models.CharField(max_length=100, blank=True, verbose_name="País de Origen")
    sitio_web = models.URLField(blank=True, verbose_name="Sitio Web Oficial")
    descripcion = models.TextField(blank=True, verbose_name="Historia / Descripción")
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")

    class Meta:
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Categoria(models.Model):
    """
    Clasificación temática o funcional del reloj.
    Ejemplo: Buceo (Diver), Cronógrafo, Aviador (Flieger), Gran Complicación, Vestir (Dress).
    """
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la Categoría")
    slug = models.SlugField(max_length=120, unique=True, blank=True, verbose_name="Slug URL")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['nombre']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre


class Reloj(models.Model):
    """
    Modelo nuclear de la tienda de alta relojería.
    Contiene la ficha técnica completa de cada pieza horológica.
    """
    class TipoMovimiento(models.TextChoices):
        AUTOMATICO = 'AUTOMATICO', 'Automático'
        CUARZO = 'CUARZO', 'Cuarzo'
        SOLAR = 'SOLAR', 'Solar'
        MANUAL = 'MANUAL', 'Cuerda Manual'

    nombre = models.CharField(max_length=200, verbose_name="Nombre del Modelo / Referencia")
    marca = models.ForeignKey(
        Marca,
        on_delete=models.CASCADE,
        related_name='relojes',
        verbose_name="Manufactura / Marca"
    )
    categorias = models.ManyToManyField(
        Categoria,
        related_name='relojes',
        blank=True,
        verbose_name="Categorías"
    )
    precio = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Precio (USD)"
    )
    stock = models.PositiveIntegerField(
        default=0,
        verbose_name="Unidades en Stock"
    )
    movimiento = models.CharField(
        max_length=20,
        choices=TipoMovimiento.choices,
        default=TipoMovimiento.AUTOMATICO,
        verbose_name="Tipo de Movimiento"
    )
    diametro_caja_mm = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        help_text="Diámetro de la caja en milímetros (ej: 40.0 o 41.5)",
        verbose_name="Diámetro de Caja (mm)"
    )
    cristal = models.CharField(
        max_length=100,
        default="Zafiro con tratamiento antirreflejos",
        verbose_name="Tipo de Cristal"
    )
    resistencia_agua_m = models.PositiveIntegerField(
        default=100,
        help_text="Hermeticidad o resistencia al agua en metros (ej: 100, 300, 600)",
        verbose_name="Resistencia al Agua (m)"
    )
    material_correa = models.CharField(
        max_length=100,
        default="Acero inoxidable 316L",
        verbose_name="Material de Correa / Brazalete"
    )
    descripcion = models.TextField(
        verbose_name="Descripción y Especificaciones de Manufactura"
    )
    imagen_url = models.URLField(
        max_length=600,
        blank=True,
        null=True,
        help_text="URL pública de alta calidad de la pieza (CDN o almacenamiento externo)",
        verbose_name="URL de Imagen"
    )
    creado_en = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Registro"
    )

    class Meta:
        verbose_name = "Reloj"
        verbose_name_plural = "Relojes"
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.marca.nombre} {self.nombre}"

    @property
    def en_stock(self):
        return self.stock > 0


EXTENSIONES_IMAGEN = ('.webp', '.jpg', '.jpeg', '.png', '.avif', '.svg')


def validar_url_imagen(valor):
    """Acepta rutas locales (/images/...) o http(s) y solo formatos de imagen conocidos (validación de tipo)."""
    if not (valor.startswith('/') or valor.startswith(('http://', 'https://'))):
        raise ValidationError('Usa una ruta que empiece con "/" o una URL http(s).')
    ruta = valor.split('?', 1)[0].lower()
    if not ruta.endswith(EXTENSIONES_IMAGEN):
        raise ValidationError('Formato no permitido. Usa: ' + ', '.join(EXTENSIONES_IMAGEN))


class ImagenReloj(models.Model):
    """
    Galería de imágenes asociadas a una pieza horológica.
    Permite administrar múltiples vistas (frontal, lateral, movimiento, etc.)
    ordenadas jerárquicamente para su visualización en el catálogo y detalle.
    """
    reloj = models.ForeignKey(
        Reloj,
        on_delete=models.CASCADE,
        related_name='imagenes',
        verbose_name="Reloj"
    )
    class Tipo(models.TextChoices):
        PRODUCTO = 'PRODUCTO', 'Fotografía de producto (fondo estándar)'
        DETALLE = 'DETALLE', 'Detalle / ambiente'
        ILUSTRACION = 'ILUSTRACION', 'Ilustración provisional'

    url = models.CharField(
        max_length=1000,
        validators=[validar_url_imagen],
        help_text="Ruta local (/images/relojes/<slug>/principal.webp) o URL https. Se prefiere local.",
        verbose_name="Ruta o URL de la imagen"
    )
    url_card = models.CharField(
        max_length=1000,
        blank=True,
        default="",
        validators=[validar_url_imagen],
        help_text="Miniatura 600x750 para tarjetas de catálogo. Si se omite se usa la imagen completa.",
        verbose_name="Miniatura para tarjeta"
    )
    es_principal = models.BooleanField(
        default=False,
        help_text="Imagen que se muestra primero. Solo una por reloj.",
        verbose_name="Imagen principal"
    )
    tipo = models.CharField(
        max_length=12,
        choices=Tipo.choices,
        default=Tipo.PRODUCTO,
        verbose_name="Tipo de imagen"
    )
    orden = models.PositiveIntegerField(
        default=1,
        verbose_name="Orden de Visualización",
        help_text="1 para imagen principal, 2 en adelante para vistas complementarias"
    )
    alt_text = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Texto Alternativo (Alt)"
    )
    creado_en = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )

    class Meta:
        verbose_name = "Imagen de Reloj"
        verbose_name_plural = "Imágenes de Reloj"
        ordering = ['orden', 'id']
        constraints = [
            # Una sola imagen principal por reloj (la BD lo garantiza aunque falle la validación del formulario).
            models.UniqueConstraint(
                fields=['reloj'],
                condition=Q(es_principal=True),
                name='unica_imagen_principal_por_reloj',
            ),
        ]

    def __str__(self):
        return f"{self.reloj.nombre} - Imagen {self.orden}"
