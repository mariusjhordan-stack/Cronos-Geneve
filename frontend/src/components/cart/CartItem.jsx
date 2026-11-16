import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { WatchImage } from '@/components/product/WatchImage';

export function CartItem({ item, onUpdateQuantity, onRemove, onNavigate }) {
  const precioUnitario = parseFloat(item.precio) || 0;
  const precioSubtotal = precioUnitario * item.cantidad;

  return (
    <div className="py-5 border-b border-cronos-line flex items-start gap-3 sm:gap-4">
      {/* Lienzo fotográfico de la pieza en fondo claro sobrio */}
      <div className="h-20 w-20 shrink-0 overflow-hidden bg-cronos-surface-1 sm:h-24 sm:w-24">
        <Link
          to={`/reloj/${item.id}`}
          onClick={onNavigate}
          className="block h-full w-full focus:outline-none"
          aria-label={`Ver detalles de ${item.nombre}`}
        >
          {item.imagen_url ? (
            <WatchImage
              src={item.imagen_url}
              alt={item.nombre}
              className="h-full w-full"
            />
          ) : (
            <span className="font-mono text-[9px] uppercase text-cronos-muted">Sin registro</span>
          )}
        </Link>
      </div>

      {/* Ficha técnica y descriptiva */}
      <div className="flex-1 min-w-0">
        <span className="block font-mono text-[9px] tracking-[0.24em] text-cronos-bronze uppercase mb-0.5">
          {item.marca_nombre}
        </span>
        <h4 className="font-serif text-base text-cronos-text truncate mb-0.5" title={item.nombre}>
          <Link
            to={`/reloj/${item.id}`}
            onClick={onNavigate}
            className="hover:text-cronos-bronze transition-colors focus:outline-none"
          >
            {item.nombre}
          </Link>
        </h4>
        <span className="block text-[10px] font-mono text-cronos-muted mb-3">
          {item.movimiento_display || item.movimiento || 'Mecánico'} &bull; {item.diametro_caja_mm} mm
        </span>

        {/* Selector de cantidad y cotización */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="inline-flex items-center border border-cronos-line bg-white">
            <button
              type="button"
              disabled={item.cantidad <= 1}
              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
              className="px-2.5 py-1 text-cronos-muted hover:text-cronos-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Disminuir unidad"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-xs font-mono text-cronos-text select-none">
              {item.cantidad}
            </span>
            <button
              type="button"
              disabled={item.cantidad >= item.stock}
              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
              className="px-2.5 py-1 text-cronos-muted hover:text-cronos-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Aumentar unidad"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-cronos-text font-medium block">
              {formatPrice(precioSubtotal)} <span className="text-[10px] text-cronos-muted font-normal">USD</span>
            </span>
            {item.cantidad > 1 && (
              <span className="text-[10px] font-mono text-cronos-muted block">
                {item.cantidad} &times; {formatPrice(precioUnitario)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botón discreto de retiro */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-cronos-muted hover:text-cronos-text p-1 transition-colors cursor-pointer shrink-0"
        title="Retirar de la bolsa"
        aria-label={`Retirar ${item.nombre} de la bolsa`}
      >
        <X className="h-4 w-4 stroke-[1.4]" />
      </button>
    </div>
  );
}

export default CartItem;
