import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { formatPrice } from '@/lib/utils';
import { WatchImage } from '@/components/product/WatchImage';

export function CartItem({ item, onUpdateQuantity, onRemove, onNavigate }) {
  const shouldReduceMotion = useReducedMotion();
  const precioUnitario = parseFloat(item.precio) || 0;
  const precioSubtotal = precioUnitario * item.cantidad;

  return (
    <motion.div
      layout={!shouldReduceMotion}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 border-b border-cronos-line py-5 sm:gap-4"
    >
      {/* Lienzo fotográfico de la pieza en fondo claro sobrio */}
      <div className="h-20 w-20 shrink-0 overflow-hidden bg-cronos-surface-1 sm:h-24 sm:w-24">
        <Link
          to={`/reloj/${item.id}`}
          onClick={onNavigate}
          className="block h-full w-full focus:outline-none"
          aria-label={`Ver detalles de ${item.nombre}`}
        >
          <WatchImage src={item.imagen_url} alt={item.nombre} className="h-full w-full" />
        </Link>
      </div>

      {/* Ficha técnica y descriptiva */}
      <div className="min-w-0 flex-1">
        <span className="mb-0.5 block font-mono text-[11px] uppercase tracking-[0.24em] text-cronos-bronze">
          {item.marca_nombre}
        </span>
        <h4 className="font-serif text-base leading-snug tracking-[0.02em] text-cronos-text">
          <Link
            to={`/reloj/${item.id}`}
            onClick={onNavigate}
            className="transition-colors hover:text-cronos-bronze focus:outline-none"
          >
            {item.nombre}
          </Link>
        </h4>

        {/* Cotización unitaria */}
        <div className="mt-1 font-mono text-xs text-cronos-muted">
          {formatPrice(precioUnitario)} <span className="text-[11px]">USD</span>
        </div>

        {/* Controles de unidades y subtotal por guardatiempo */}
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center border border-cronos-line bg-white">
            <button
              type="button"
              disabled={item.cantidad <= 1}
              onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
              className="cursor-pointer p-1.5 text-cronos-muted transition-colors hover:bg-cronos-surface-1 hover:text-cronos-text disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Restar una unidad de ${item.nombre}`}
            >
              <Minus className="h-3 w-3 stroke-[1.5]" />
            </button>
            <span className="w-8 text-center font-mono text-xs text-cronos-text">
              {item.cantidad}
            </span>
            <button
              type="button"
              disabled={item.stock !== undefined && item.cantidad >= item.stock}
              onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
              className="cursor-pointer p-1.5 text-cronos-muted transition-colors hover:bg-cronos-surface-1 hover:text-cronos-text disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Añadir una unidad de ${item.nombre}`}
            >
              <Plus className="h-3 w-3 stroke-[1.5]" />
            </button>
          </div>

          <span className="font-mono text-xs font-medium tracking-wider text-cronos-text">
            {formatPrice(precioSubtotal)} <span className="text-[11px] text-cronos-muted">USD</span>
          </span>
        </div>
      </div>

      {/* Retiro de pieza */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="cursor-pointer p-1 text-cronos-muted transition-colors hover:text-cronos-text focus:outline-none"
        aria-label={`Retirar ${item.nombre} de la bolsa`}
        title="Retirar de la bolsa"
      >
        <X className="h-3.5 w-3.5 stroke-[1.4]" />
      </button>
    </motion.div>
  );
}

export default CartItem;
