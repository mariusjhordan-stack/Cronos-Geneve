import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { OrderPrintReceipt } from '@/components/orders/OrderPrintReceipt';

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
      <div className="no-print screen-only mx-auto max-w-7xl px-4 py-32 text-center">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          CARGANDO ORDEN #{id}...
        </span>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="no-print screen-only mx-auto max-w-xl px-4 py-24 text-center">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          CRONOS GENÈVE / ORDER CONFIRMATION
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
  const fechaEmision = orden.creado_en ? new Date(orden.creado_en).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '—';

  return (
    <>
      {/* VISTA EN PANTALLA (Normal, oculta durante la impresión) */}
      <div className="no-print screen-only mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 1. BARRA SUPERIOR DE ACCIONES (Oculta al imprimir) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-cronos-line">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-cronos-bronze shrink-0 stroke-[1.4]" />
            <div>
              <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block">
                ACQUISITION CONFIRMED &bull; ORDEN #{orden.id}
              </span>
              <h1 className="font-serif text-xl sm:text-2xl text-cronos-text font-normal">
                CONFIRMACIÓN DE ORDEN
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <Link to="/mis-ordenes">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-cronos-text hover:text-cronos-bronze">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>VOLVER A MIS ÓRDENES</span>
                </Button>
              </Link>
            ) : (
              <Link to="/#catalogo">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>COLECCIÓN</span>
                </Button>
              </Link>
            )}
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>IMPRIMIR COMPROBANTE</span>
            </Button>
          </div>
        </div>

        {/* 2. COMPROBANTE DE ORDEN EN PANTALLA */}
        <div className="certificate-print-container border border-cronos-line bg-white p-6 sm:p-12 relative shadow-xs">
          {/* Cabecera del Comprobante */}
          <div className="text-center pb-8 border-b border-cronos-line">
            <span className="font-mono text-[9px] sm:text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
              CRONOS GENÈVE &bull; ORDER CONFIRMATION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.04em] mb-2 uppercase font-normal">
              ORDEN REGISTRADA #{orden.id}
            </h2>
            <span className="font-mono text-[10px] text-cronos-muted tracking-widest uppercase block">
              REGISTRO DE ADQUISICIÓN — PROYECTO ACADÉMICO SIN COBRO BANCARIO REAL
            </span>
          </div>

          {/* Franja de metadatos reales de la orden */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-cronos-line text-center">
            <div>
              <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
                ID DE ORDEN
              </span>
              <span className="font-mono text-sm sm:text-base text-cronos-bronze font-medium">
                #{orden.id}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
                CÓDIGO DE REFERENCIA
              </span>
              <span className="font-mono text-sm sm:text-base text-cronos-text font-medium">
                {codigoOrden}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
                FECHA DE REGISTRO
              </span>
              <span className="font-mono text-xs text-cronos-muted">
                {fechaEmision}
              </span>
            </div>
          </div>

          {/* Mensaje de confirmación editorial neutro */}
          <div className="py-6">
            <p className="font-sans text-xs sm:text-sm text-cronos-muted leading-relaxed max-w-3xl mx-auto text-left">
              Su orden ha sido recibida y registrada exitosamente en el sistema de <strong className="text-cronos-text font-normal">Cronos Genève</strong>. A continuación se detalla la información del pedido y las piezas seleccionadas:
            </p>
          </div>

          {/* Cuadro de identidad del cliente y envío */}
          <div className="border border-cronos-line bg-cronos-surface-1 p-5 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-cronos-muted block text-[10px] uppercase tracking-wider">Cliente:</span>
                <span className="text-cronos-text font-serif text-sm">{orden.cliente_nombre}</span>
              </div>
              <div>
                <span className="text-cronos-muted block text-[10px] uppercase tracking-wider">Correo Electrónico:</span>
                <span className="text-cronos-text">{orden.cliente_email}</span>
              </div>
              <div>
                <span className="text-cronos-muted block text-[10px] uppercase tracking-wider">Teléfono de Contacto:</span>
                <span className="text-cronos-text">{orden.cliente_telefono}</span>
              </div>
              <div>
                <span className="text-cronos-muted block text-[10px] uppercase tracking-wider">Dirección de Envío:</span>
                <span className="text-cronos-text">{orden.direccion_envio}{orden.ciudad ? `, ${orden.ciudad}` : ''}{orden.pais ? `, ${orden.pais}` : ''}</span>
              </div>
              <div>
                <span className="text-cronos-muted block text-[10px] uppercase tracking-wider">Estado de la Orden:</span>
                <span className="text-cronos-bronze font-medium">{orden.estado_display || orden.estado}</span>
              </div>
              <div>
                <span className="text-cronos-muted block text-[10px] uppercase tracking-wider">Términos de Garantía:</span>
                <span className="text-cronos-text">{orden.garantia_aceptada ? 'Términos Aceptados' : 'No Registrada'}</span>
              </div>
              {orden.notas && (
                <div className="sm:col-span-2 border-t border-cronos-line/40 pt-2 mt-1">
                  <span className="text-cronos-muted block text-[10px] uppercase tracking-wider">Notas Adicionales:</span>
                  <span className="text-cronos-text font-sans text-xs">{orden.notas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de piezas seleccionadas */}
          <div className="border-t border-cronos-line pt-6 mb-8 overflow-x-auto">
            <table className="w-full text-left text-xs font-sans min-w-[500px]">
              <thead>
                <tr className="border-b border-cronos-line font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                  <th className="pb-3">PIEZA & REFERENCIA</th>
                  <th className="pb-3 text-center">CANTIDAD</th>
                  <th className="pb-3 text-right">PRECIO UNITARIO</th>
                  <th className="pb-3 text-right">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cronos-line/60">
                {orden.detalles?.map((det) => (
                  <tr key={det.id} className="text-xs">
                    <td className="py-4">
                      <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block">
                        {det.reloj_marca || det.reloj_detalle?.marca_nombre}
                      </span>
                      <strong className="font-serif text-sm sm:text-base text-cronos-text block font-normal">
                        {det.reloj_nombre || det.reloj_detalle?.nombre}
                      </strong>
                      {det.reloj_detalle && (
                        <span className="font-mono text-[10px] text-cronos-muted">
                          Movimiento: {det.reloj_detalle.movimiento_display || det.reloj_detalle.movimiento || 'Mecánico'} &bull; Caja: {det.reloj_detalle.diametro_caja_mm} mm
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-center font-mono text-cronos-text">
                      {det.cantidad}
                    </td>
                    <td className="py-4 text-right font-mono text-cronos-muted">
                      {formatPrice(det.precio_unitario)}
                    </td>
                    <td className="py-4 text-right font-mono text-cronos-text font-medium">
                      {formatPrice(det.subtotal)} USD
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-cronos-line font-mono">
                  <td colSpan={3} className="pt-4 text-right text-cronos-muted uppercase tracking-wider text-xs">
                    TOTAL:
                  </td>
                  <td className="pt-4 text-right text-base sm:text-lg text-cronos-text font-bold">
                    {formatPrice(orden.total)} USD
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pie institucional sobrio */}
          <div className="border-t border-cronos-line pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-mono text-[10px] text-cronos-muted">
            <div>
              <span className="text-cronos-bronze uppercase block tracking-widest font-medium">CRONOS GENÈVE</span>
              <span>Haute Horlogerie &bull; Registro Digital de Órdenes</span>
            </div>
            <div className="text-right sm:text-right">
              <span>Comprobante generado electrónicamente</span>
              <span className="block text-cronos-muted/60">ID: {orden.id} &bull; {codigoOrden}</span>
            </div>
          </div>
        </div>

        {/* 3. BARRA INFERIOR DE RETORNO EDITORIAL */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-cronos-line">
          {isAuthenticated ? (
            <Link
              to="/mis-ordenes"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-cronos-text hover:text-cronos-bronze uppercase transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>VOLVER A MIS ÓRDENES</span>
            </Link>
          ) : (
            <Link
              to="/#catalogo"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-cronos-text hover:text-cronos-bronze uppercase transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>VOLVER AL CATÁLOGO</span>
            </Link>
          )}

          <Link
            to="/#catalogo"
            className="font-mono text-[11px] tracking-wider text-cronos-muted hover:text-cronos-text uppercase transition-colors"
          >
            [ EXPLORAR NUEVAS PIEZAS &rarr; ]
          </Link>
        </div>
      </div>

      {/* COMPROBANTE EXCLUSIVO PARA IMPRESIÓN (oculto en pantalla, visible al imprimir) */}
      <div className="print-only">
        <OrderPrintReceipt orden={orden} />
      </div>
    </>
  );
}
export default ConfirmationPage;
