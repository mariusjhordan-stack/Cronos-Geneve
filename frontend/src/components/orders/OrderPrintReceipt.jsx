import React from 'react';
import { formatPrice } from '@/lib/utils';

export function OrderPrintReceipt({ orden }) {
  if (!orden) return null;

  const fechaEmision = orden.creado_en
    ? new Date(orden.creado_en).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const estadoReal = orden.estado_display || orden.estado || 'SOLICITADA';
  const codigoOrden = orden.codigo_orden || `#CRONOS-${String(orden.id).padStart(5, '0')}-2026`;

  return (
    <article className="print-receipt font-sans text-neutral-900 bg-white p-6 max-w-4xl mx-auto">
      {/* 1. Marca e Identificación */}
      <header className="border-b-2 border-neutral-800 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.2em] uppercase text-neutral-900 m-0">
            CRONOS GENÈVE
          </h1>
          <p className="font-mono text-[10px] tracking-widest text-neutral-600 uppercase mt-1 mb-0">
            COMPROBANTE DE ORDEN
          </p>
        </div>
        <div className="text-right font-mono text-xs text-neutral-800">
          <div>
            <span className="font-semibold">NÚMERO DE ORDEN:</span> #{orden.id}
          </div>
          {codigoOrden && (
            <div className="text-[11px] text-neutral-600 mt-0.5">
              Ref: {codigoOrden}
            </div>
          )}
          <div className="text-[11px] text-neutral-600 mt-0.5">
            Fecha: {fechaEmision}
          </div>
        </div>
      </header>

      {/* 2. Estado Real y Garantía */}
      <section className="print-avoid-break grid grid-cols-2 gap-4 border border-neutral-300 p-4 mb-6 text-xs bg-neutral-50/50">
        <div>
          <span className="font-mono text-[10px] text-neutral-600 uppercase block tracking-wider mb-1 font-semibold">
            ESTADO DE LA ORDEN
          </span>
          <span className="font-medium text-neutral-900 text-sm">
            {estadoReal}
          </span>
        </div>
        <div>
          <span className="font-mono text-[10px] text-neutral-600 uppercase block tracking-wider mb-1 font-semibold">
            DECLARACIÓN DE GARANTÍA
          </span>
          <span className="text-neutral-900 text-sm font-medium">
            Garantía aceptada: {orden.garantia_aceptada ? 'Sí' : 'No'}
          </span>
        </div>
      </section>

      {/* 3. Datos del Cliente y Dirección de Envío */}
      <section className="print-avoid-break grid grid-cols-2 gap-6 border-b border-neutral-300 pb-6 mb-6 text-xs">
        <div>
          <h2 className="font-mono text-[10px] tracking-wider text-neutral-700 uppercase font-semibold mb-2">
            DATOS DEL CLIENTE
          </h2>
          <div className="space-y-1 text-neutral-800">
            <div>
              <span className="text-neutral-600">Nombre:</span>{' '}
              <strong className="text-neutral-900 font-semibold">{orden.cliente_nombre}</strong>
            </div>
            <div>
              <span className="text-neutral-600">Correo:</span>{' '}
              <span className="text-neutral-900">{orden.cliente_email}</span>
            </div>
            {orden.cliente_telefono ? (
              <div>
                <span className="text-neutral-600">Teléfono:</span>{' '}
                <span className="text-neutral-900">{orden.cliente_telefono}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="font-mono text-[10px] tracking-wider text-neutral-700 uppercase font-semibold mb-2">
            DIRECCIÓN DE ENVÍO
          </h2>
          <div className="space-y-1 text-neutral-800">
            <div>
              <span className="text-neutral-600">Dirección:</span>{' '}
              <span className="text-neutral-900">{orden.direccion_envio}</span>
            </div>
            <div>
              <span className="text-neutral-600">Ciudad:</span>{' '}
              <span className="text-neutral-900">{orden.ciudad || '—'}</span>
            </div>
            <div>
              <span className="text-neutral-600">País:</span>{' '}
              <span className="text-neutral-900">{orden.pais || '—'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tabla de Productos Adquiridos */}
      <section className="mb-6">
        <h2 className="font-mono text-[10px] tracking-wider text-neutral-700 uppercase font-semibold mb-3">
          PRODUCTOS
        </h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-400 font-mono text-[10px] text-neutral-700 uppercase tracking-wider">
              <th className="py-2.5 pr-3 text-left">PRODUCTO</th>
              <th className="py-2.5 px-3 text-center w-24">CANTIDAD</th>
              <th className="py-2.5 px-3 text-right w-32">PRECIO UNITARIO</th>
              <th className="py-2.5 pl-3 text-right w-32">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {(orden.detalles || []).map((det) => {
              const watchBrand = det.reloj_marca || det.reloj_detalle?.marca_nombre;
              const watchName = det.reloj_nombre || det.reloj_detalle?.nombre || `Reloj #${det.reloj}`;

              return (
                <tr key={det.id} className="print-avoid-break">
                  <td className="py-2.5 pr-3">
                    {watchBrand && (
                      <span className="font-mono text-[9px] text-neutral-600 uppercase block">
                        {watchBrand}
                      </span>
                    )}
                    <span className="font-medium text-neutral-900 block">
                      {watchName}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-neutral-800">
                    {det.cantidad}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-neutral-700">
                    {formatPrice(det.precio_unitario)}
                  </td>
                  <td className="py-2.5 pl-3 text-right font-mono font-medium text-neutral-900">
                    {formatPrice(det.subtotal)} USD
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-neutral-400">
              <td colSpan={3} className="pt-3 text-right font-mono text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                TOTAL:
              </td>
              <td className="pt-3 pl-3 text-right font-mono text-base font-bold text-neutral-900">
                {formatPrice(orden.total)} USD
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* 5. Notas si existen */}
      {orden.notas && (
        <section className="print-avoid-break border-t border-neutral-300 pt-3 mb-6 text-xs text-neutral-800">
          <span className="font-mono text-[10px] text-neutral-600 uppercase block tracking-wider mb-0.5 font-semibold">
            NOTAS:
          </span>
          <p className="m-0 leading-relaxed font-sans">{orden.notas}</p>
        </section>
      )}

      {/* 6. Pie factual del documento */}
      <footer className="print-avoid-break border-t border-neutral-300 pt-4 mt-8 flex justify-between items-center text-[10px] font-mono text-neutral-500">
        <div>
          CRONOS GENÈVE &bull; Comprobante emitido electrónicamente
        </div>
        <div>
          Orden #{orden.id}
        </div>
      </footer>
    </article>
  );
}
