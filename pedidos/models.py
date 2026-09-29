from django.db import models
from decimal import Decimal


class Orden(models.Model):
    """
    Entidad que registra una transacción comercial y el despacho de piezas.
    """
    class EstadoOrden(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente de Pago'
        PAGADO = 'PAGADO', 'Pago Confirmado'
        EN_PREPARACION = 'EN_PREPARACION', 'En Preparación de Bóveda'
        ENVIADO = 'ENVIADO', 'Enviado por Transporte Asegurado'
        ENTREGADO = 'ENTREGADO', 'Entregado al Cliente'
        CANCELADO = 'CANCELADO', 'Cancelado'

    cliente_nombre = models.CharField(max_length=150, verbose_name="Nombre Completo del Cliente")
    cliente_email = models.EmailField(verbose_name="Correo Electrónico")
    cliente_telefono = models.CharField(max_length=30, verbose_name="Teléfono de Contacto")
    direccion_envio = models.TextField(verbose_name="Dirección de Envío Segura")
    ciudad = models.CharField(max_length=100, default="Lima", verbose_name="Ciudad / Localidad")
    pais = models.CharField(max_length=100, default="Perú", verbose_name="País")
    estado = models.CharField(
        max_length=25,
        choices=EstadoOrden.choices,
        default=EstadoOrden.PENDIENTE,
        verbose_name="Estado de la Orden"
    )
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Monto Total (USD)"
    )
    notas = models.TextField(blank=True, verbose_name="Instrucciones Especiales de Entrega")
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    actualizado_en = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    class Meta:
        verbose_name = "Orden de Compra"
        verbose_name_plural = "Órdenes de Compra"
        ordering = ['-creado_en']

    def __str__(self):
        return f"Orden #{self.id:05d} - {self.cliente_nombre} (${self.total})"

    def actualizar_total(self):
        """
        Recalcula la suma de todos los subtotales de la orden.
        """
        total_acumulado = sum(detalle.subtotal for detalle in self.detalles.all())
        self.total = total_acumulado
        self.save(update_fields=['total'])


class DetalleOrden(models.Model):
    """
    Línea de ítem que vincula la orden con un reloj específico del catálogo.
    """
    orden = models.ForeignKey(
        Orden,
        on_delete=models.CASCADE,
        related_name='detalles',
        verbose_name="Orden Asociada"
    )
    reloj = models.ForeignKey(
        'catalogo.Reloj',
        on_delete=models.PROTECT,
        related_name='detalles_pedido',
        verbose_name="Pieza de Relojería"
    )
    precio_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Precio Unitario al Momento de Compra"
    )
    cantidad = models.PositiveIntegerField(
        default=1,
        verbose_name="Cantidad"
    )

    class Meta:
        verbose_name = "Detalle de Orden"
        verbose_name_plural = "Detalles de Orden"

    def __str__(self):
        return f"{self.cantidad}x {self.reloj.nombre} (Orden #{self.orden.id:05d})"

    @property
    def subtotal(self):
        return self.precio_unitario * self.cantidad

    def save(self, *args, **kwargs):
        # Si no se especificó precio unitario, tomar el precio actual del reloj
        if not self.precio_unitario:
            self.precio_unitario = self.reloj.precio
        super().save(*args, **kwargs)
        # Actualiza el total de la orden cabecera
        self.orden.actualizar_total()
