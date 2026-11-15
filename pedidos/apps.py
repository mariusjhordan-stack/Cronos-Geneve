from django.apps import AppConfig
from django.core.checks import Error, register, Tags


def check_mercadopago_settings(app_configs, **kwargs):
    from django.conf import settings
    from urllib.parse import urlparse
    errors = []
    public_base = getattr(settings, 'PUBLIC_BASE_URL', '').strip().rstrip('/')
    raw_return = getattr(settings, 'MERCADOPAGO_RETURN_BASE_URL', '').strip().rstrip('/')
    raw_wh = getattr(settings, 'MERCADOPAGO_WEBHOOK_URL', '').strip().rstrip('/')

    if public_base:
        parsed_pub = urlparse(public_base)
        if raw_return:
            parsed_ret = urlparse(raw_return)
            if parsed_ret.netloc != parsed_pub.netloc:
                errors.append(Error(
                    f'MERCADOPAGO_RETURN_BASE_URL ({raw_return}) no coincide con PUBLIC_BASE_URL ({public_base}).',
                    hint='Elimina MERCADOPAGO_RETURN_BASE_URL de tu .env o alinéala con PUBLIC_BASE_URL.',
                    id='pedidos.E001',
                ))
        if raw_wh:
            parsed_wh = urlparse(raw_wh)
            if parsed_wh.netloc != parsed_pub.netloc:
                errors.append(Error(
                    f'MERCADOPAGO_WEBHOOK_URL ({raw_wh}) no coincide con PUBLIC_BASE_URL ({public_base}).',
                    hint='Elimina MERCADOPAGO_WEBHOOK_URL de tu .env o alinéala con PUBLIC_BASE_URL.',
                    id='pedidos.E002',
                ))
    return errors


class PedidosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pedidos'
    verbose_name = 'Gestión de Pedidos y Ventas'

    def ready(self):
        register(Tags.compatibility)(check_mercadopago_settings)
