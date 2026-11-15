from django.core.management.base import BaseCommand
from pedidos.payments import get_payment_diagnostics


class Command(BaseCommand):
    help = 'Diagnóstico seguro del estado y coherencia de la integración con Mercado Pago Checkout Pro.'

    def handle(self, *args, **options):
        diag = get_payment_diagnostics()

        self.stdout.write('=' * 65)
        self.stdout.write('   CRONOS GENÈVE — DIAGNÓSTICO MERCADO PAGO CHECKOUT PRO')
        self.stdout.write('=' * 65)
        self.stdout.write(f'PUBLIC_BASE_URL efectiva:    {diag["public_base_url"]}')
        self.stdout.write(f'URL de Retorno efectiva:     {diag["return_url"]}')
        self.stdout.write(f'URL de Webhook efectiva:     {diag["webhook_url"]}')
        self.stdout.write(f'Entorno configurado:         {diag["environment"]}')
        self.stdout.write(f'Access Token:                {diag["token_status"]}')
        self.stdout.write(f'Webhook Secret:              {"Configurado" if diag["has_webhook_secret"] else "Ausente"}')
        self.stdout.write(f'URLs Coherentes:             {"SÍ" if diag["urls_coherent"] else "NO"}')
        self.stdout.write(f'Listo para Preferencias:     {"SÍ" if diag["can_create_preferences"] else "NO"}')
        self.stdout.write('-' * 65)

        if diag['issues']:
            self.stdout.write(self.style.ERROR('Problemas detectados:'))
            for issue in diag['issues']:
                self.stdout.write(self.style.ERROR(f'  - {issue}'))
            self.stdout.write('=' * 65)
            return

        self.stdout.write(self.style.SUCCESS('Configuración válida y coherente con la fuente de verdad.'))
        self.stdout.write('=' * 65)
