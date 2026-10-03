# Generated - adjusted manually for unique token backfill
import uuid
from django.db import migrations, models


def asignar_tokens_unicos(apps, schema_editor):
    Orden = apps.get_model('pedidos', 'Orden')
    for orden in Orden.objects.all():
        orden.token_acceso = uuid.uuid4()
        orden.save(update_fields=['token_acceso'])


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='orden',
            name='garantia_aceptada',
            field=models.BooleanField(default=False, verbose_name='Declaración de Custodia / Garantía Aceptada'),
        ),
        migrations.AddField(
            model_name='orden',
            name='token_acceso',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True, blank=True, verbose_name='Token de Acceso al Certificado'),
        ),
        migrations.RunPython(asignar_tokens_unicos, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='orden',
            name='token_acceso',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name='Token de Acceso al Certificado'),
        ),
        migrations.AlterField(
            model_name='orden',
            name='estado',
            field=models.CharField(choices=[('SOLICITADA', 'Solicitud Registrada (Protocolo Académico)'), ('PENDIENTE', 'Pendiente de Revisión'), ('PAGADO', 'Pago Confirmado (Legado)'), ('EN_PREPARACION', 'En Preparación de Bóveda'), ('ENVIADO', 'Enviado por Transporte Asegurado'), ('ENTREGADO', 'Entregado al Cliente'), ('CANCELADO', 'Cancelado')], default='PENDIENTE', max_length=25, verbose_name='Estado de la Orden'),
        ),
    ]
