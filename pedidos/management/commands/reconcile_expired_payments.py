from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from pedidos.models import Orden
from pedidos.payments import (
    PaymentConfigurationError,
    PaymentProviderError,
    cancel_payment,
    fetch_payment,
    payment_config,
    reconcile_payment,
    release_reservation,
    search_payments,
)


class Command(BaseCommand):
    help = 'Cancela pagos pendientes vencidos y libera sus reservas verificadas.'

    def handle(self, *args, **options):
        try:
            payment_config()
        except PaymentConfigurationError as exc:
            raise CommandError(str(exc)) from None

        orders = Orden.objects.filter(
            stock_reservado=True,
            reserva_expira_en__lte=timezone.now(),
            estado_pago__in=(Orden.EstadoPago.PENDIENTE, Orden.EstadoPago.RECHAZADO),
        ).order_by('reserva_expira_en')
        released = 0
        deferred = 0
        for candidate in orders.iterator():
            try:
                payments = search_payments(candidate.referencia_pago)
                states = []
                for result in payments:
                    payment_id = str(result.get('id', ''))
                    if not payment_id.isdigit():
                        continue
                    payment = fetch_payment(payment_id)
                    if payment.get('status') in ('pending', 'in_process', 'authorized'):
                        payment = cancel_payment(payment_id)
                    reconcile_payment(payment)
                    states.append(payment.get('status'))

                candidate.refresh_from_db()
                if candidate.estado_pago == Orden.EstadoPago.APROBADO:
                    continue
                if any(state in ('pending', 'in_process', 'authorized') for state in states):
                    deferred += 1
                    continue
                release_reservation(candidate.id, Orden.EstadoPago.EXPIRADO)
                released += 1
            except PaymentProviderError:
                # No liberar stock si Mercado Pago está indisponible o no confirma cancelación.
                deferred += 1
        self.stdout.write(self.style.SUCCESS(f'Reservas liberadas: {released}; conservadas para revisión: {deferred}.'))
