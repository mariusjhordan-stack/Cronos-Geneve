import React from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

export function CompareTable({ pieces = [], onRemovePiece }) {
  const { addToCart } = useCart();

  if (pieces.length === 0) {
    return null;
  }

  const attributes = [
    { label: 'REGISTRO VISUAL', key: 'imagen' },
    { label: 'MANUFACTURA', key: 'marca' },
    { label: 'MODELO / REFERENCIA', key: 'nombre' },
    { label: 'COTIZACIÓN (USD)', key: 'precio' },
    { label: 'TIPO DE MOVIMIENTO', key: 'movimiento' },
    { label: 'DIÁMETRO DE CAJA', key: 'diametro' },
    { label: 'HERMETICIDAD', key: 'resistencia' },
    { label: 'CRISTAL HOROLÓGICO', key: 'cristal' },
    { label: 'MATERIAL DE CORREA', key: 'correa' },
    { label: 'DISPONIBILIDAD', key: 'stock' },
    { label: 'PROTOCOLO DE RESERVA', key: 'accion' },
  ];

  return (
    <div className="border border-cronos-line bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] sm:min-w-[680px] lg:min-w-[760px] border-collapse text-left text-xs">
          {/* Encabezado con nombres y botón de remoción */}
          <thead>
            <tr className="border-b border-cronos-line bg-cronos-surface-1">
              <th className="w-1/4 min-w-[120px] sm:min-w-[160px] lg:min-w-[200px] p-3 sm:p-4 font-mono text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest text-cronos-muted uppercase sticky left-0 bg-cronos-surface-1 z-10 border-r border-cronos-line">
                ESPECIFICACIÓN
              </th>
              {pieces.map((piece) => (
                <th key={piece.id} className="p-3 sm:p-4 text-center border-r border-cronos-line last:border-r-0 min-w-[200px] sm:min-w-[220px] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase">
                      {piece.marca_nombre || piece.marca_detalle?.nombre || 'Manufactura Suiza'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemovePiece(piece.id)}
                      className="text-cronos-muted hover:text-cronos-text p-1 transition-colors cursor-pointer"
                      title="Retirar de la matriz"
                      aria-label={`Retirar ${piece.nombre} de la matriz`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg text-cronos-text font-normal truncate">
                    <Link to={`/reloj/${piece.id}`} className="hover:text-cronos-bronze transition-colors">
                      {piece.nombre}
                    </Link>
                  </h3>
                </th>
              ))}
            </tr>
          </thead>

          {/* Cuerpo de atributos */}
          <tbody className="divide-y divide-cronos-line/60">
            {attributes.map((attr) => (
              <tr key={attr.key} className="hover:bg-cronos-surface-1/60 transition-colors group">
                <td className="min-w-[120px] sm:min-w-[160px] lg:min-w-[200px] p-3 sm:p-4 font-mono text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest text-cronos-muted uppercase sticky left-0 bg-white group-hover:bg-cronos-surface-1 z-10 border-r border-cronos-line align-middle transition-colors">
                  {attr.label}
                </td>

                {pieces.map((piece) => {
                  if (attr.key === 'imagen') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center border-r border-cronos-line last:border-r-0 align-middle">
                        <div className="h-36 w-full flex items-center justify-center p-2 bg-cronos-surface-1/40">
                          <Link to={`/reloj/${piece.id}`}>
                            {piece.imagen_url ? (
                              <img
                                src={piece.imagen_url}
                                alt={piece.nombre}
                                className="max-h-32 max-w-[140px] object-contain transition-transform duration-500 hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/relojes/placeholder-reloj.svg';
                                }}
                              />
                            ) : (
                              <span className="font-mono text-[9px] text-cronos-muted">[ ARCHIVO RESERVADO ]</span>
                            )}
                          </Link>
                        </div>
                      </td>
                    );
                  }

                  if (attr.key === 'marca') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-mono text-xs font-medium text-cronos-text border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.marca_nombre || piece.marca_detalle?.nombre || 'Manufactura Suiza'}
                      </td>
                    );
                  }

                  if (attr.key === 'nombre') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-serif text-sm sm:text-base text-cronos-text border-r border-cronos-line last:border-r-0 align-middle font-normal">
                        <Link to={`/reloj/${piece.id}`} className="hover:text-cronos-bronze transition-colors">
                          {piece.nombre}
                        </Link>
                      </td>
                    );
                  }

                  if (attr.key === 'precio') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-mono text-sm text-cronos-text font-normal border-r border-cronos-line last:border-r-0 align-middle">
                        {formatPrice(piece.precio)} <span className="text-[10px] text-cronos-muted">USD</span>
                      </td>
                    );
                  }

                  if (attr.key === 'movimiento') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-mono text-xs text-cronos-text border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.movimiento_display || piece.movimiento}
                      </td>
                    );
                  }

                  if (attr.key === 'diametro') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-mono text-xs text-cronos-text border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.diametro_caja_mm} mm
                      </td>
                    );
                  }

                  if (attr.key === 'resistencia') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-mono text-xs text-cronos-text border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.resistencia_agua_m} m WR
                      </td>
                    );
                  }

                  if (attr.key === 'cristal') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-sans text-xs text-cronos-muted border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.cristal || '—'}
                      </td>
                    );
                  }

                  if (attr.key === 'correa') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-sans text-xs text-cronos-muted border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.material_correa || '—'}
                      </td>
                    );
                  }

                  if (attr.key === 'stock') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center font-mono text-xs border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.stock > 0 ? (
                          <span className="text-cronos-bronze">
                            {piece.stock} {piece.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
                          </span>
                        ) : (
                          <span className="text-red-600">[ AGOTADO ]</span>
                        )}
                      </td>
                    );
                  }

                  if (attr.key === 'accion') {
                    return (
                      <td key={piece.id} className="p-3 sm:p-4 text-center border-r border-cronos-line last:border-r-0 align-middle">
                        {piece.stock > 0 ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => addToCart(piece, 1)}
                            className="w-full flex items-center justify-center gap-1.5 font-mono text-[10px] tracking-widest uppercase"
                          >
                            <span>RESERVAR</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="font-mono text-[10px] text-cronos-muted uppercase block py-1">
                            [ BAJO ENCARGO ]
                          </span>
                        )}
                      </td>
                    );
                  }

                  return null;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
