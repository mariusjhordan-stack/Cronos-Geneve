import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="py-4 border-b border-cronos-line/60 flex items-start gap-4">
      {/* Photo canvas */}
      <div className="h-20 w-20 shrink-0 bg-black/50 border border-cronos-line flex items-center justify-center p-1.5 overflow-hidden">
        {item.imagen_url ? (
          <img
            src={item.imagen_url}
            alt={item.nombre}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
            }}
          />
        ) : (
          <span className="text-[9px] font-mono text-cronos-muted">NO IMAGE</span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <span className="block font-mono text-[9px] tracking-widest text-cronos-bronze uppercase">
          {item.marca_nombre}
        </span>
        <h4 className="font-serif text-sm text-white truncate mb-1" title={item.nombre}>
          {item.nombre}
        </h4>
        <span className="block text-[10px] font-mono text-cronos-muted mb-2">
          {item.movimiento_display} &bull; {item.diametro_caja_mm} MM
        </span>

        {/* Stepper & Price */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center border border-cronos-line">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
              className="px-2 py-1 text-cronos-muted hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Disminuir unidad"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-xs font-mono text-white">
              {item.cantidad}
            </span>
            <button
              type="button"
              disabled={item.cantidad >= item.stock}
              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
              className="px-2 py-1 text-cronos-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar unidad"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-white block">
              {formatPrice(item.precio * item.cantidad)}
            </span>
            {item.cantidad > 1 && (
              <span className="text-[10px] font-mono text-cronos-muted">
                {item.cantidad} x {formatPrice(item.precio)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-cronos-muted/60 hover:text-red-400 p-1 transition-colors"
        title="Retirar de la selección"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
