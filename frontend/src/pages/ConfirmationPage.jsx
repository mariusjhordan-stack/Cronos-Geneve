import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { OrderReceipt } from '@/components/orders/OrderReceipt';

export function ConfirmationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadOrden() {
      setLoading(true);
      setError(null);
      try {
        const token = searchParams.get('token') || api.getOrderToken(id) || '';
        if (token && String(api.getOrderToken(id) || '') !== String(token)) {
          api.saveOrderToken(id, token);
        }
        const data = await api.getOrden(id, token);
        if (!cancelled) setOrden(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'No fue posible recuperar los datos de la orden');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrden();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { cancelled = true; };
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          CARGANDO ORDEN #{id}...
        </span>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="font-mono text-[11px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          CRONOS GENÈVE / CONFIRMACIÓN DE ORDEN
        </span>
        <h2 className="font-serif text-3xl text-cronos-text mb-4">
          ORDEN NO DISPONIBLE
        </h2>
        <p className="text-xs text-cronos-muted font-sans mb-6 leading-relaxed">
          {error || 'No se encontró la orden especificada o la clave de acceso ha expirado.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated && (
            <Link to="/mis-ordenes">
              <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider">
                &larr; VOLVER A MIS ÓRDENES
              </Button>
            </Link>
          )}
          <Link to="/#catalogo">
            <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider">
              &larr; RETORNAR A LA COLECCIÓN
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const codigoOrden = orden.codigo_orden || `#CRONOS-${String(orden.id).padStart(5, '0')}-2026`;

  // "Descargar PDF" = diálogo de impresión del navegador (Guardar como PDF). El título del
  // documento es el nombre sugerido del archivo y se restaura al terminar.
  const handleDownloadPdf = () => {
    const previousTitle = document.title;
    document.title = `Comprobante-${codigoOrden.replace('#', '')}`;
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Barra de acciones (no se imprime) */}
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-cronos-line pb-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 shrink-0 stroke-[1.4] text-cronos-bronze" />
          <div>
            <span className="block font-mono text-[11px] uppercase tracking-widest-brand text-cronos-bronze">
              Orden #{orden.id} registrada
            </span>
            <h1 className="font-serif text-xl font-normal text-cronos-text sm:text-2xl">Confirmación de orden</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to={isAuthenticated ? '/mis-ordenes' : '/#catalogo'}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isAuthenticated ? 'Mis órdenes' : 'Colección'}</span>
            </Button>
          </Link>
          <Button onClick={handleDownloadPdf} className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-wider">
            <Download className="h-4 w-4" />
            <span>Descargar PDF</span>
          </Button>
        </div>
      </div>

      {/* Plantilla única: la misma para pantalla y PDF */}
      <div className="border border-cronos-line/80 print:border-0">
        <OrderReceipt orden={orden} />
      </div>

      <div className="no-print mt-8 flex flex-col items-center justify-between gap-4 border-t border-cronos-line pt-4 sm:flex-row">
        <Link to={isAuthenticated ? '/mis-ordenes' : '/#catalogo'} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cronos-text transition-colors hover:text-cronos-bronze">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{isAuthenticated ? 'Volver a mis órdenes' : 'Volver al catálogo'}</span>
        </Link>
        <Link to="/#catalogo" className="font-mono text-xs uppercase tracking-wider text-cronos-muted transition-colors hover:text-cronos-text">
          Explorar nuevas piezas →
        </Link>
      </div>
    </div>
  );
}
export default ConfirmationPage;
