import uuid

import django.db.models.deletion
from django.db import migrations, models


def assign_payment_references(apps, schema_editor):
    Orden = apps.get_model('pedidos', 'Orden')
    for order in Orden.objects.filter(referencia_pago__isnull=True).iterator():
        order.referencia_pago = uuid.uuid4()
        order.save(update_fields=['referencia_pago'])


class Migration(migrations.Migration):
    dependencies = [('pedidos', '0003_orden_usuario')]

    operations = [
        migrations.AddField(
            model_name='orden', name='referencia_pago',
            field=models.UUIDField(null=True, blank=True, unique=True),
        ),
        migrations.AddField(
            model_name='orden', name='clave_idempotencia',
            field=models.UUIDField(null=True, blank=True, unique=True),
        ),
        migrations.AddField(
            model_name='orden', name='estado_pago',
            field=models.CharField(choices=[
                ('NO_INICIADO', 'No iniciado'), ('PENDIENTE', 'Pendiente'),
                ('APROBADO', 'Aprobado'), ('RECHAZADO', 'Rechazado'),
                ('CANCELADO', 'Cancelado'), ('EXPIRADO', 'Expirado'),
                ('ERROR', 'Error de integración'), ('REEMBOLSADO', 'Reembolsado'),
                ('CONTRACARGO', 'Contracargo'),
            ], default='NO_INICIADO', max_length=20),
        ),
        migrations.AddField(
            model_name='orden', name='monto_pago',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='orden', name='moneda_pago',
            field=models.CharField(blank=True, default='', max_length=3),
        ),
        migrations.AddField(
            model_name='orden', name='preferencia_pago_id',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='orden', name='url_pago',
            field=models.URLField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name='orden', name='pago_gateway_id',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='orden', name='stock_reservado',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='orden', name='reserva_expira_en',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='orden', name='conflicto_stock_pago',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='orden', name='pago_actualizado_en',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(assign_payment_references, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='orden', name='referencia_pago',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.CreateModel(
            name='PagoMercadoPago',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('payment_id', models.CharField(max_length=100, unique=True)),
                ('estado', models.CharField(max_length=30)),
                ('detalle_estado', models.CharField(blank=True, max_length=100)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=12)),
                ('moneda', models.CharField(max_length=3)),
                ('external_reference', models.UUIDField(db_index=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('orden', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pagos_gateway', to='pedidos.orden')),
            ],
            options={'ordering': ['-actualizado_en']},
        ),
    ]
