import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const PAYMENT_COPY = {
  APROBADO: { label: 'PAGO APROBADO', description: 'Mercado Pago confirmó el pago. La orden quedó registrada.', Icon: CheckCircle2, style: 'text-emerald-700' },
  PENDIENTE: { label: 'PAGO PENDIENTE', description: 'Mercado Pago aún está procesando el pago. El inventario permanece reservado temporalmente.', Icon: Clock3, style: 'text-amber-700' },
  RECHAZADO: { label: 'PAGO RECHAZADO', description: 'Mercado Pago rechazó el intento. La reserva se liberará al vencer el plazo configurado.', Icon: XCircle, style: 'text-red-700' },
  CANCELADO: { label: 'PAGO CANCELADO', description: 'El pago fue cancelado. La reserva se liberará al vencer el plazo configurado.', Icon: XCircle, style: 'text-red-700' },
  EXPIRADO: { label: 'PAGO EXPIRADO', description: 'El plazo de pago venció y el inventario reservado fue liberado.', Icon: XCircle, style: 'text-cronos-muted' },
  ERROR: { label: 'PAGO NO INICIADO', description: 'No se pudo crear el checkout. No se completó ningún cobro.', Icon: XCircle, style: 'text-red-700' },
};

export function PaymentReturnPage() {
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const reference = params.get('external_reference') || '';
  const paymentId = params.get('payment_id') || params.get('collection_id') || '';
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let timer;
    let attempts = 0;

    const check = async () => {
      if (!reference) {
        if (active) {
          setError('No se recibió una referencia válida para consultar el pago.');
          setLoading(false);
        }
        return;
      }
      try {
        const result = await api.getPaymentStatus(reference, paymentId);
        if (!active) return;
        setPayment(result);
        setError('');
        if (result.estado_pago === 'PENDIENTE' && attempts < 4) {
          attempts += 1;
          timer = window.setTimeout(check, 2500);
          return;
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'No fue posible verificar el estado del pago.');
      } finally {
        if (active) setLoading(false);
      }
    };

    check();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [reference, paymentId]);

  const state = PAYMENT_COPY[payment?.estado_pago];
  const Icon = state?.Icon || Clock3;

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <div className="border border-cronos-line bg-white p-8 text-center shadow-xs sm:p-12">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze">CRONOS GENÈVE · CHECKOUT PRO</span>
        {loading ? (
          <p className="mt-8 animate-pulse font-mono text-xs tracking-widest text-cronos-muted">VERIFICANDO EL ESTADO CON MERCADO PAGO…</p>
        ) : error ? (
          <>
            <h1 className="mt-5 font-serif text-3xl text-cronos-text">ESTADO NO DISPONIBLE</h1>
            <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>
            <p className="mt-3 text-xs text-cronos-muted">El retorno del navegador no confirma el pago. Consulta nuevamente desde el mismo enlace o revisa tus órdenes.</p>
          </>
        ) : (
          <>
            <Icon className={`mx-auto mt-8 h-10 w-10 ${state?.style || 'text-cronos-bronze'}`} />
            <h1 className={`mt-4 font-serif text-3xl ${state?.style || 'text-cronos-text'}`}>{state?.label || 'PAGO EN REVISIÓN'}</h1>
            <p className="mt-4 text-sm text-cronos-muted">{state?.description || 'El estado sigue pendiente de confirmación server-side.'}</p>
            {payment?.monto && <p className="mt-3 font-mono text-xs text-cronos-text">Importe verificado: {payment.monto} {payment.moneda}</p>}
          </>
        )}
        {reference && <p className="mt-5 break-all font-mono text-[10px] text-cronos-muted">Referencia: {reference}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {isAuthenticated && <Link to="/mis-ordenes"><Button variant="outline" size="sm">MIS ÓRDENES</Button></Link>}
          <Link to="/"><Button size="sm">VOLVER AL CATÁLOGO</Button></Link>
        </div>
      </div>
    </section>
  );
}
