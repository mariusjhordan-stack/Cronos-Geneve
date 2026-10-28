import uuid
from django.conf import settings
from django.db import models
from decimal import Decimal


class Orden(models.Model):
    """
    Entidad que registra una transacción comercial y el despacho de piezas.
    """
    class EstadoOrden(models.TextChoices):
        SOLICITADA = 'SOLICITADA', 'Solicitud Registrada (Protocolo Académico)'
        PENDIENTE = 'PENDIENTE', 'Pendiente de Revisión'
        PAGADO = 'PAGADO', 'Pago Confirmado (Legado)'
        EN_PREPARACION = 'EN_PREPARACION', 'En Preparación de Bóveda'
        ENVIADO = 'ENVIADO', 'Enviado por Transporte Asegurado'
        ENTREGADO = 'ENTREGADO', 'Entregado al Cliente'
        CANCELADO = 'CANCELADO', 'Cancelado'

    class EstadoPago(models.TextChoices):
        NO_INICIADO = 'NO_INICIADO', 'No iniciado'
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        APROBADO = 'APROBADO', 'Aprobado'
        RECHAZADO = 'RECHAZADO', 'Rechazado'
        CANCELADO = 'CANCELADO', 'Cancelado'
        EXPIRADO = 'EXPIRADO', 'Expirado'
        ERROR = 'ERROR', 'Error de integración'
        REEMBOLSADO = 'REEMBOLSADO', 'Reembolsado'
        CONTRACARGO = 'CONTRACARGO', 'Contracargo'

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
    garantia_aceptada = models.BooleanField(
        default=False,
        verbose_name="Declaración de Custodia / Garantía Aceptada"
    )
    token_acceso = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="Token de Acceso al Certificado"
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='ordenes',
        verbose_name='Usuario asociado',
    )
    referencia_pago = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    clave_idempotencia = models.UUIDField(null=True, blank=True, unique=True)
    estado_pago = models.CharField(
        max_length=20,
        choices=EstadoPago.choices,
        default=EstadoPago.NO_INICIADO,
    )
    monto_pago = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    moneda_pago = models.CharField(max_length=3, blank=True, default='')
    preferencia_pago_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    url_pago = models.URLField(max_length=1000, blank=True)
    pago_gateway_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    stock_reservado = models.BooleanField(default=False)
    reserva_expira_en = models.DateTimeField(null=True, blank=True)
    conflicto_stock_pago = models.BooleanField(default=False)
    pago_actualizado_en = models.DateTimeField(null=True, blank=True)
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


class PagoMercadoPago(models.Model):
    """Registro mínimo e idempotente de cada intento de pago verificado."""
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='pagos_gateway')
    payment_id = models.CharField(max_length=100, unique=True)
    estado = models.CharField(max_length=30)
    detalle_estado = models.CharField(max_length=100, blank=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    moneda = models.CharField(max_length=3)
    external_reference = models.UUIDField(db_index=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-actualizado_en']

    def __str__(self):
        return f'Pago {self.payment_id} — orden #{self.orden_id}'
