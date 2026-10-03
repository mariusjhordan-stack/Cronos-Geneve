from django.conf import settings
from django.db import models


class Perfil(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='perfil',
    )
    telefono = models.CharField(max_length=30, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Perfil de {self.usuario.username}'


class Direccion(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='direcciones',
    )
    etiqueta = models.CharField(max_length=60)
    destinatario = models.CharField(max_length=150)
    telefono = models.CharField(max_length=30)
    direccion = models.CharField(max_length=300)
    ciudad = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True)
    codigo_postal = models.CharField(max_length=20, blank=True)
    pais = models.CharField(max_length=100)
    es_predeterminada = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-es_predeterminada', '-actualizado_en']
        constraints = [
            models.UniqueConstraint(
                fields=['usuario'],
                condition=models.Q(es_predeterminada=True),
                name='una_direccion_predeterminada_por_usuario',
            ),
        ]

    def __str__(self):
        return f'{self.etiqueta} — {self.usuario.username}'


class Favorito(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favoritos',
    )
    reloj = models.ForeignKey(
        'catalogo.Reloj',
        on_delete=models.CASCADE,
        related_name='favoritos',
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado_en']
        constraints = [
            models.UniqueConstraint(
                fields=['usuario', 'reloj'],
                name='favorito_unico_por_usuario_y_reloj',
            ),
        ]

    def __str__(self):
        return f'{self.usuario.username} — {self.reloj}'
