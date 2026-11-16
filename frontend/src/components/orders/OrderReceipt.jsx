import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const dateTime = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeStyle: 'short' });
const shortDate = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' });
const pen = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

function fmt(formatter, value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : formatter.format(d);
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
        <circle cx="20" cy="20" r="18" fill="none" stroke="#171717" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="14.5" fill="none" stroke="#A58A68" strokeWidth="0.75" />
        <path d="M20 8v12l7 4" fill="none" stroke="#171717" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="20" cy="20" r="1.6" fill="#A58A68" />
      </svg>
      <div>
        <div className="font-serif text-xl uppercase leading-none tracking-[0.2em] text-cronos-text">Cronos Genève</div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-cronos-muted">Alta relojería</div>
      </div>
    </div>
  );
}

function Seal({ confirmed }) {
  const text = confirmed ? 'CRONOS GENÈVE · PAGO CONFIRMADO · ' : 'CRONOS GENÈVE · ORDEN REGISTRADA · ';
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0" role="img" aria-label="Sello del comprobante">
      <defs>
        <path id="seal-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#A58A68" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="#A58A68" strokeWidth="0.75" />
      <text fontSize="9" letterSpacing="2.2" fill="#A58A68" fontFamily="monospace">
        <textPath href="#seal-circle">{text}</textPath>
      </text>
      <path d="M46 61l10 10 19-21" fill="none" stroke="#A58A68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <dt className="font-mono text-[11px] uppercase tracking-wider text-cronos-muted">{label}</dt>
      <dd className="m-0 mt-0.5 break-words text-sm text-cronos-text">{children || '—'}</dd>
    </div>
  );
}

/**
 * Plantilla ÚNICA del comprobante: se ve igual en pantalla y al imprimir / guardar como PDF.
 * Las reglas de impresión viven en index.css bajo `.print-receipt`.
 */
export function OrderReceipt({ orden }) {
  if (!orden) return null;

  const codigo = orden.codigo_orden || `#CRONOS-${String(orden.id).padStart(5, '0')}-2026`;
  const pago = orden.pago || {};
  const confirmado = Boolean((orden.linea_tiempo || []).find((p) => p.clave === 'pagada')?.completado);
  const montoPen = pago.monto ? pen.format(parseFloat(pago.monto)) : null;
  const tipoCambio = pago.tipo_cambio ? parseFloat(pago.tipo_cambio).toFixed(4) : null;

  return (
    <article className="print-receipt mx-auto w-full max-w-4xl bg-white p-6 text-cronos-text sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-cronos-text pb-6">
        <Logo />
        <div className="text-right">
          <div className="font-mono text-[11px] uppercase tracking-widest text-cronos-muted">Comprobante de orden</div>
          <div className="mt-1 font-mono text-lg font-semibold">{codigo}</div>
          <div className="mt-1 font-mono text-xs text-cronos-muted">Emitido: {fmt(dateTime, orden.creado_en)}</div>
        </div>
      </header>

      <section className="print-avoid-break flex flex-wrap items-center justify-between gap-6 border-b border-cronos-line py-6">
        <dl className="m-0 grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Field label="N.º de orden">#{orden.id}</Field>
          <Field label="N.º de serie">
            <span className="font-mono text-xs">{orden.numero_serie}</span>
          </Field>
          <Field label="Estado de la orden">{orden.estado_display || orden.estado}</Field>
          <Field label="Garantía">{orden.garantia_display}</Field>
        </dl>
        <div className="flex items-center gap-4">
          <Seal confirmed={confirmado} />
          <figure className="m-0 text-center">
            <QRCodeSVG value={codigo} size={88} level="M" marginSize={0} aria-label={`Código QR de la referencia ${codigo}`} />
            <figcaption className="mt-1 font-mono text-[11px] text-cronos-muted">Referencia</figcaption>
          </figure>
        </div>
      </section>

      <section className="print-avoid-break grid grid-cols-1 gap-6 border-b border-cronos-line py-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-cronos-bronze">Cliente</h2>
          <dl className="m-0 space-y-3">
            <Field label="Nombre">{orden.cliente_nombre}</Field>
            <Field label="Correo">{orden.cliente_email}</Field>
            <Field label="Teléfono">{orden.cliente_telefono}</Field>
          </dl>
        </div>
        <div>
          <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-cronos-bronze">Envío</h2>
          <dl className="m-0 space-y-3">
            <Field label="Dirección">{orden.direccion_completa || orden.direccion_envio}</Field>
            {orden.notas ? <Field label="Notas de entrega">{orden.notas}</Field> : null}
          </dl>
        </div>
      </section>

      <section className="py-6">
        <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-cronos-bronze">Piezas</h2>
        <table className="receipt-table w-full border-collapse text-left text-sm">
          <colgroup>
            <col />
            <col style={{ width: '12%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '19%' }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-cronos-text font-mono text-[11px] uppercase tracking-wider text-cronos-muted">
              <th className="py-2 pr-3 font-normal">Pieza</th>
              <th className="px-2 py-2 text-center font-normal">Cant.</th>
              <th className="px-2 py-2 text-right font-normal">P. unitario</th>
              <th className="py-2 pl-2 text-right font-normal">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(orden.detalles || []).map((det) => (
              <tr key={det.id} className="print-avoid-break border-b border-cronos-line">
                <td className="py-3 pr-3 align-top">
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-cronos-bronze">
                    {det.reloj_marca || det.reloj_detalle?.marca_nombre}
                  </span>
                  <span className="block font-serif text-base">{det.reloj_nombre || det.reloj_detalle?.nombre || `Reloj #${det.reloj}`}</span>
                </td>
                <td className="px-2 py-3 text-center align-top font-mono">{det.cantidad}</td>
                <td className="px-2 py-3 text-right align-top font-mono">{formatPrice(det.precio_unitario)}</td>
                <td className="py-3 pl-2 text-right align-top font-mono font-medium">{formatPrice(det.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="print-avoid-break ml-auto mt-4 w-full max-w-xs space-y-1 font-mono text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-cronos-muted">Total (USD)</dt>
            <dd className="m-0 text-base font-bold">{formatPrice(orden.total)}</dd>
          </div>
          {tipoCambio && (
            <div className="flex justify-between gap-4 text-xs text-cronos-muted">
              <dt>Tipo de cambio</dt>
              <dd className="m-0">1 USD = S/ {tipoCambio}</dd>
            </div>
          )}
          {montoPen && (
            <div className="flex justify-between gap-4 border-t border-cronos-line pt-1">
              <dt className="text-cronos-muted">Total en soles</dt>
              <dd className="m-0 font-bold">{montoPen}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="print-avoid-break grid grid-cols-1 gap-6 border-t border-cronos-line py-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-cronos-bronze">Pago</h2>
          <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Método">{pago.proveedor || 'Mercado Pago'}</Field>
            <Field label="Estado del pago">{orden.estado_pago_display}</Field>
            <Field label="N.º de operación" className="col-span-2">
              <span className="font-mono text-xs">{pago.operacion || 'Aún sin operación'}</span>
            </Field>
            <Field label="Monto cobrado">{montoPen}</Field>
            <Field label="Fecha de pago">{fmt(shortDate, pago.fecha)}</Field>
          </dl>
        </div>
        <div>
          <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-cronos-bronze">Seguimiento</h2>
          <ol className="m-0 list-none space-y-3 p-0">
            {(orden.linea_tiempo || []).map((paso) => (
              <li key={paso.clave} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    paso.completado ? 'border-cronos-bronze bg-cronos-bronze text-white' : 'border-cronos-line text-transparent'
                  }`}
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className={`text-sm ${paso.completado ? 'text-cronos-text' : 'text-cronos-muted'}`}>
                  {paso.etiqueta}
                  {paso.fecha && <span className="block font-mono text-[11px] text-cronos-muted">{fmt(dateTime, paso.fecha)}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="print-avoid-break mt-4 flex flex-wrap justify-between gap-2 border-t border-cronos-line pt-4 font-mono text-[11px] text-cronos-muted">
        <span>Cronos Genève · Comprobante emitido electrónicamente</span>
        <span>{codigo}</span>
      </footer>
    </article>
  );
}
