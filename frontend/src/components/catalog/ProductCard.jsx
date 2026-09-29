import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';

export function ProductCard({ reloj }) {
  const { addToCart } = useCart();
  const { toggleCompare, isCompared } = useCompare();

  const brandName = reloj.marca_nombre || reloj.marca_detalle?.nombre || 'Manufactura Suiza';
  const price = parseFloat(reloj.precio);
  const inStock = reloj.stock > 0;
  const compared = isCompared(reloj.id);

  return (
    <article className="group relative flex flex-col justify-between p-6 sm:p-8 bg-transparent transition-colors hover:bg-white/[0.015]">
      <div>
        {/* 1. MARCA */}
        <div className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase text-center mb-1">
          {brandName}
        </div>

        {/* 2. MODELO (Cormorant Garamond Prominente) */}
        <h3 className="font-serif text-lg sm:text-xl text-center text-white tracking-[0.06em] leading-snug mb-6">
          <Link
            to={`/reloj/${reloj.id}`}
            className="hover:text-cronos-bronze transition-colors focus:outline-none"
          >
            {reloj.nombre}
          </Link>
        </h3>

        {/* 3. FOTOGRAFÍA (Directamente en lienzo #111214, sin box shadow ni cards flotantes) */}
        <div className="relative aspect-[4/5] w-full flex items-center justify-center p-4 mb-6">
          <Link
            to={`/reloj/${reloj.id}`}
            className="flex h-full w-full items-center justify-center"
            aria-label={`Ver especificaciones de ${reloj.nombre}`}
          >
            {reloj.imagen_url ? (
              <img
                src={reloj.imagen_url}
                alt={`${brandName} ${reloj.nombre}`}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
                }}
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center border border-cronos-line bg-black/40">
                <span className="font-mono text-[9px] tracking-widest text-cronos-muted">
                  [ ARCHIVO RESERVADO ]
                </span>
              </div>
            )}
          </Link>

          {/* Indicador Discreto de Stock */}
          <div className="absolute top-2 right-2">
            {!inStock && (
              <span className="font-mono text-[9px] tracking-widest text-red-400">
                [ AGOTADO ]
              </span>
            )}
            {inStock && reloj.stock === 1 && (
              <span className="font-mono text-[9px] tracking-widest text-cronos-bronze">
                [ PIEZA ÚNICA ]
              </span>
            )}
            {inStock && reloj.stock > 1 && reloj.stock <= 3 && (
              <span className="font-mono text-[9px] tracking-widest text-cronos-muted">
                [ {reloj.stock} DISPONIBLES ]
              </span>
            )}
          </div>
        </div>

        {/* 4. ESPECIFICACIONES TÉCNICAS (Centrado, conciso) */}
        <div className="text-center font-mono text-[10px] tracking-widest text-cronos-muted mb-3">
          {reloj.movimiento_display || reloj.movimiento} &bull; {reloj.diametro_caja_mm} MM &bull; {reloj.resistencia_agua_m} M WR
        </div>

        {/* 5. PRECIO */}
        <div className="text-center font-mono text-base text-white tracking-wider mb-6">
          {formatPrice(price)} <span className="text-[10px] text-cronos-muted">USD</span>
        </div>
      </div>

      {/* 6. ACCIONES EDITORIALES DISCRETAS */}
      <div className="pt-2 flex flex-col items-center gap-2.5">
        {inStock ? (
          <button
            type="button"
            onClick={() => addToCart(reloj, 1)}
            className="w-full border-b border-cronos-bronze pb-1.5 pt-1 text-center font-mono text-xs tracking-[0.2em] text-white hover:text-cronos-bronze uppercase transition-colors"
          >
            RESERVAR PIEZA &rarr;
          </button>
        ) : (
          <span className="py-1.5 font-mono text-[10px] tracking-[0.18em] text-cronos-muted uppercase">
            [ BAJO ENCARGO PRIVADO ]
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleCompare(reloj)}
          className={`font-mono text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1.5 py-1 ${
            compared
              ? 'text-cronos-bronze font-medium'
              : 'text-cronos-muted/70 hover:text-white'
          }`}
        >
          {compared ? (
            <>
              <Check className="h-3 w-3 stroke-[2]" />
              <span>EN MATRIZ</span>
            </>
          ) : (
            <span>+ COMPARAR</span>
          )}
        </button>
      </div>
    </article>
  );
}
