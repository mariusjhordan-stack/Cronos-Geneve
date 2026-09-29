import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export function CompareTable({ pieces = [], onRemovePiece }) {
  const { addToCart } = useCart();

  if (pieces.length === 0) {
    return null;
  }

  const attributes = [
    { label: 'REGISTRO VISUAL', key: 'imagen' },
    { label: 'MANUFACTURA', key: 'marca' },
    { label: 'REFERENCIA / MODELO', key: 'nombre' },
    { label: 'COTIZACIÓN (USD)', key: 'precio' },
    { label: 'TIPO DE MOVIMIENTO', key: 'movimiento' },
    { label: 'DIÁMETRO DE CAJA', key: 'diametro' },
    { label: 'RESISTENCIA AL AGUA', key: 'resistencia' },
    { label: 'CRISTAL HOROLÓGICO', key: 'cristal' },
    { label: 'MATERIAL DE CORREA', key: 'correa' },
    { label: 'DISPONIBILIDAD BÓVEDA', key: 'stock' },
    { label: 'ACCIÓN', key: 'accion' },
  ];

  const colWidth = pieces.length === 2 ? 'w-[38%]' : 'w-[28%]';

  return (
    <div className="overflow-x-auto border border-cronos-line bg-cronos-surface/60">
      <table className="w-full min-w-[700px] border-collapse text-left text-xs">
        {/* Encabezado con nombres y botón de remoción */}
        <thead>
          <tr className="border-b border-cronos-line bg-cronos-surface">
            <th className="w-[20%] p-4 font-mono text-[10px] tracking-widest text-cronos-muted uppercase sticky left-0 bg-cronos-surface z-10 border-r border-cronos-line">
              ESPECIFICACIÓN
            </th>
            {pieces.map((piece) => (
              <th key={piece.id} className={`${colWidth} p-4 text-center border-r border-cronos-line last:border-r-0`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase">
                    {piece.marca_nombre || piece.marca_detalle?.nombre || 'Suiza'}
                  </span>
                  <button
                    onClick={() => onRemovePiece(piece.id)}
                    className="text-cronos-muted hover:text-red-400 p-1 transition-colors"
                    title="Remover de la matriz"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="font-serif text-sm text-white font-normal truncate">
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
            <tr key={attr.key} className="hover:bg-white/[0.015]">
              <td className="p-4 font-mono text-[10px] tracking-widest text-cronos-muted uppercase sticky left-0 bg-cronos-surface z-10 border-r border-cronos-line">
                {attr.label}
              </td>

              {pieces.map((piece) => {
                if (attr.key === 'imagen') {
                  return (
                    <td key={piece.id} className="p-4 text-center border-r border-cronos-line last:border-r-0">
                      <div className="h-36 w-full flex items-center justify-center p-2">
                        {piece.imagen_url ? (
                          <img
                            src={piece.imagen_url}
                            alt={piece.nombre}
                            className="max-h-full max-w-[140px] object-contain filter drop-shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                            }}
                          />
                        ) : (
                          <span className="font-mono text-[9px] text-cronos-muted">[ SIN REGISTRO ]</span>
                        )}
                      </div>
                    </td>
                  );
                }

                if (attr.key === 'marca') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-mono font-medium text-white border-r border-cronos-line last:border-r-0">
                      {piece.marca_nombre || piece.marca_detalle?.nombre || 'Suiza'}
                    </td>
                  );
                }

                if (attr.key === 'nombre') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-serif text-white border-r border-cronos-line last:border-r-0">
                      {piece.nombre}
                    </td>
                  );
                }

                if (attr.key === 'precio') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-mono text-sm text-cronos-bronze font-medium border-r border-cronos-line last:border-r-0">
                      {formatPrice(piece.precio)} USD
                    </td>
                  );
                }

                if (attr.key === 'movimiento') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-mono text-cronos-text border-r border-cronos-line last:border-r-0">
                      {piece.movimiento_display || piece.movimiento}
                    </td>
                  );
                }

                if (attr.key === 'diametro') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-mono text-cronos-text border-r border-cronos-line last:border-r-0">
                      {piece.diametro_caja_mm} mm
                    </td>
                  );
                }

                if (attr.key === 'resistencia') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-mono text-cronos-text border-r border-cronos-line last:border-r-0">
                      {piece.resistencia_agua_m} metros WR
                    </td>
                  );
                }

                if (attr.key === 'cristal') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-sans text-xs text-cronos-muted border-r border-cronos-line last:border-r-0">
                      {piece.cristal}
                    </td>
                  );
                }

                if (attr.key === 'correa') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-sans text-xs text-cronos-muted border-r border-cronos-line last:border-r-0">
                      {piece.material_correa}
                    </td>
                  );
                }

                if (attr.key === 'stock') {
                  return (
                    <td key={piece.id} className="p-4 text-center font-mono text-xs border-r border-cronos-line last:border-r-0">
                      {piece.stock > 0 ? (
                        <span className="text-cronos-bronze">
                          {piece.stock} unidad{piece.stock > 1 ? 'es' : ''} disponible{piece.stock > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-red-400">Agotado</span>
                      )}
                    </td>
                  );
                }

                if (attr.key === 'accion') {
                  return (
                    <td key={piece.id} className="p-4 text-center border-r border-cronos-line last:border-r-0">
                      {piece.stock > 0 ? (
                        <button
                          type="button"
                          onClick={() => addToCart(piece, 1)}
                          className="border-b border-cronos-bronze pb-1 font-mono text-[10px] tracking-widest text-white hover:text-cronos-bronze uppercase transition-colors"
                        >
                          RESERVAR &rarr;
                        </button>
                      ) : (
                        <span className="font-mono text-[9px] text-cronos-muted uppercase">
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
  );
}
