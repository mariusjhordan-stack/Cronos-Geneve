import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { api } from '@/services/api';

export function ConfirmationPage() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrden() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getOrden(id);
        setOrden(data);
      } catch (err) {
        setError(err.message || 'No fue posible recuperar el certificado de la orden');
      } finally {
        setLoading(false);
      }
    }
    loadOrden();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          GENERANDO CERTIFICADO OFICIAL DE BÓVEDA #{id}...
        </span>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="font-mono text-[10px] tracking-widest text-red-400 uppercase block mb-2">
          CERTIFICADO NO DISPONIBLE
        </span>
        <h2 className="font-serif text-2xl text-white mb-4">Registro no localizado</h2>
        <p className="text-xs text-cronos-muted font-sans mb-6">
          {error || 'No se encontró la orden especificada en el archivo notarial.'}
        </p>
        <Link to="/">
          <Button variant="outline" size="sm">
            &larr; RETORNAR AL CATÁLOGO
          </Button>
        </Link>
      </div>
    );
  }

  const codigoOrden = orden.codigo_orden || `#CRONOS-${String(orden.id).padStart(5, '0')}-2026`;
  const numeroSerie = orden.numero_serie || `CE-GENEVE-${String(orden.id).padStart(5, '0')}-${new Date(orden.creado_en).toISOString().slice(0, 10).replace(/-/g, '')}`;
  const fechaEmision = new Date(orden.creado_en).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top action bar (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-cronos-line">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-cronos-bronze" />
          <div>
            <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block">
              TRANSACTION CONFIRMÉE &bull; ENVOI SÉCURISÉ
            </span>
            <h1 className="font-serif text-xl sm:text-2xl text-white">
              CERTIFICAT OFFICIEL D'AUTHENTICITÉ
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>CATÁLOGO</span>
            </Button>
          </Link>
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>IMPRIMIR CERTIFICADO (PDF)</span>
          </Button>
        </div>
      </div>

      {/* DOCUMENTO NOTARIAL: CERTIFICADO DE AUTENTICIDAD HOROLÓGICA */}
      <div className="certificate-print-container border border-cronos-line bg-cronos-surface p-6 sm:p-12 shadow-2xl relative">
        {/* Geneva Manufacture Header */}
        <div className="text-center pb-8 border-b border-cronos-line">
          <span className="font-mono text-[9px] sm:text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
            MANUFACTURE D'HORLOGERIE GENÈVE &bull; SUISSE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-[0.1em] mb-2 uppercase">
            CERTIFICAT D'AUTHENTICITÉ
          </h2>
          <span className="font-mono text-[10px] text-cronos-muted tracking-widest uppercase">
            ACTE NOTARIÉ DE CUSTODIE ET TRANSFERT HORLOGER
          </span>
        </div>

        {/* Unique codes strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-cronos-line text-center">
          <div>
            <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              CÓDIGO DE ORDEN
            </span>
            <span className="font-mono text-sm sm:text-base text-cronos-bronze font-medium">
              {codigoOrden}
            </span>
          </div>
          <div>
            <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              REGISTRO DE BÓVEDA
            </span>
            <span className="font-mono text-sm sm:text-base text-white font-medium">
              {numeroSerie}
            </span>
          </div>
          <div>
            <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              FECHA DE CONSIGNACIÓN
            </span>
            <span className="font-mono text-xs text-cronos-muted">
              {fechaEmision}
            </span>
          </div>
        </div>

        {/* Solemn notarial text */}
        <div className="py-6">
          <p className="font-sans text-xs sm:text-sm text-cronos-muted leading-relaxed max-w-3xl mx-auto text-left">
            Por medio del presente instrumento notarial, la Casa <strong className="text-white">Cronos Genève</strong> certifica que los guardatiempos consignados a continuación han sido retirados de nuestra bóveda de preservación, inspeccionados bajo tolerancias cronométricas oficiales de la manufactura y asignados con carácter solemne e inmutable a su titular:
          </p>
        </div>

        {/* Custodian identity box */}
        <div className="border border-cronos-line bg-cronos-surface-2 p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <span className="text-cronos-muted block text-[10px] uppercase">Titular:</span>
              <span className="text-white font-serif text-sm">{orden.cliente_nombre}</span>
            </div>
            <div>
              <span className="text-cronos-muted block text-[10px] uppercase">Correo Certificado:</span>
              <span className="text-white">{orden.cliente_email}</span>
            </div>
            <div>
              <span className="text-cronos-muted block text-[10px] uppercase">Teléfono de Enlace:</span>
              <span className="text-white">{orden.cliente_telefono}</span>
            </div>
            <div>
              <span className="text-cronos-muted block text-[10px] uppercase">Destino Registrado:</span>
              <span className="text-white">{orden.direccion_envio}, {orden.ciudad}, {orden.pais}</span>
            </div>
            <div>
              <span className="text-cronos-muted block text-[10px] uppercase">Modalidad de Custodia:</span>
              <span className="text-cronos-bronze">Transporte Blindado Asegurado</span>
            </div>
            <div>
              <span className="text-cronos-muted block text-[10px] uppercase">Estado de Bóveda:</span>
              <span className="text-emerald-400 font-medium">{orden.estado_display || orden.estado}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-cronos-line pt-6 mb-8 overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-cronos-line font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                <th className="pb-3">MANUFACTURA & REFERENCIA</th>
                <th className="pb-3 text-center">UNIDADES</th>
                <th className="pb-3 text-right">COTIZACIÓN UNITARIA</th>
                <th className="pb-3 text-right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cronos-line/60">
              {orden.detalles?.map((det) => (
                <tr key={det.id} className="text-xs">
                  <td className="py-4">
                    <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block">
                      {det.reloj_marca || det.reloj_detalle?.marca_nombre}
                    </span>
                    <strong className="font-serif text-sm sm:text-base text-white block">
                      {det.reloj_nombre || det.reloj_detalle?.nombre}
                    </strong>
                    {det.reloj_detalle && (
                      <span className="font-mono text-[10px] text-cronos-muted">
                        Calibre: {det.reloj_detalle.movimiento_display || det.reloj_detalle.movimiento} &bull; Caja: {det.reloj_detalle.diametro_caja_mm} MM &bull; {det.reloj_detalle.resistencia_agua_m} M WR
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-center font-mono text-white">
                    {det.cantidad}
                  </td>
                  <td className="py-4 text-right font-mono text-cronos-muted">
                    {formatPrice(det.precio_unitario)}
                  </td>
                  <td className="py-4 text-right font-mono text-white font-medium">
                    {formatPrice(det.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-cronos-line font-mono">
                <td colSpan={3} className="pt-4 text-right text-cronos-muted uppercase tracking-wider text-xs">
                  COTIZACIÓN TOTAL CERTIFICADA:
                </td>
                <td className="pt-4 text-right text-base sm:text-lg text-cronos-bronze font-bold">
                  {formatPrice(orden.total)} USD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notarial Signatures and Seal */}
        <div className="border-t border-cronos-line pt-8 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center font-mono text-[10px] text-cronos-muted">
          <div>
            <div className="h-12 border-b border-cronos-line/60 mb-2 flex items-end justify-center pb-1 text-white font-serif italic text-sm">
              Dr. Jean-Marc Vacheron
            </div>
            <span>CONSERVATEUR DE LA BOURSE</span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-full border border-cronos-bronze/60 flex items-center justify-center p-1 text-[8px] text-cronos-bronze tracking-tight uppercase text-center mb-1">
              SCEAU OFFICIEL GENÈVE
            </div>
            <span>REGISTRE NOTARIÉ SUISSE</span>
          </div>

          <div>
            <div className="h-12 border-b border-cronos-line/60 mb-2 flex items-end justify-center pb-1 text-white font-serif italic text-sm">
              Henri-Frédéric Amiel
            </div>
            <span>OFFICIER D'AUTHENTICITÉ COSC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
