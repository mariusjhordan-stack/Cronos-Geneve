import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

export function ProductCard({ reloj }) {
  const { addToCart } = useCart();
  const { toggleCompare, isCompared } = useCompare();
  const { isFavorite, toggleFavorite, isProcessing } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const brandName = reloj.marca_nombre || reloj.marca_detalle?.nombre || 'Manufactura Suiza';
  const price = parseFloat(reloj.precio);
  const inStock = reloj.stock > 0;
  const compared = isCompared(reloj.id);
  const isFav = isFavorite(reloj.id);
  const processingFav = isProcessing(reloj.id);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (processingFav) return;
    await toggleFavorite(reloj);
  };

  const cardImage = (reloj.imagenes && reloj.imagenes.length > 0)
    ? reloj.imagenes[0].url
    : reloj.imagen_url;

  return (
    <article className="group relative flex flex-col justify-between p-6 sm:p-8 bg-white transition-colors hover:bg-[#FAF9F6]/60 h-full">
      <div className="flex flex-col flex-1">
        {/* 1. LIENZO FOTOGRÁFICO PROTAGONISTA CON FONDO ALABASTRO */}
        <div className="relative aspect-[4/5] w-full bg-[#FAF9F6] border border-cronos-line flex items-center justify-center p-6 mb-6 overflow-hidden">
          <Link
            to={`/reloj/${reloj.id}`}
            className="flex h-full w-full items-center justify-center focus:outline-none"
            aria-label={`Ver detalles de ${reloj.nombre}`}
          >
            {cardImage ? (
              <img
                src={cardImage}
                alt={`${brandName} ${reloj.nombre}`}
                className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/images/relojes/placeholder-reloj.svg';
                }}
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center border border-cronos-line bg-white">
                <span className="font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                  [ SIN REGISTRO ]
                </span>
              </div>
            )}
          </Link>

          {/* Botón de Favorito Flotante Discreto */}
          <button
            type="button"
            disabled={processingFav}
            onClick={handleToggleFavorite}
            aria-label={isFav ? `Retirar ${reloj.nombre} de favoritos privados` : `Añadir ${reloj.nombre} a favoritos privados`}
            title={isFav ? 'En favoritos privados' : 'Añadir a favoritos privados'}
            className="absolute top-3 right-3 p-2 text-cronos-muted hover:text-cronos-bronze transition-colors cursor-pointer disabled:opacity-50 focus:outline-none bg-white/90 backdrop-blur-xs border border-cronos-line"
          >
            <Heart
              className={`h-4 w-4 stroke-[1.4] transition-all duration-200 ${
                isFav ? 'fill-cronos-bronze text-cronos-bronze' : 'hover:scale-110'
              }`}
            />
          </button>

          {/* Indicador Discreto de Stock */}
          <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
            {!inStock && (
              <span className="font-mono text-[9px] tracking-widest text-red-700 bg-white/95 px-2 py-0.5 border border-red-200">
                AGOTADO
              </span>
            )}
            {inStock && reloj.stock === 1 && (
              <span className="font-mono text-[9px] tracking-widest text-cronos-bronze bg-white/95 px-2 py-0.5 border border-cronos-line">
                PIEZA ÚNICA
              </span>
            )}
          </div>
        </div>

        {/* 2. INFORMACIÓN EDITORIAL DEL GUARDATIEMPO */}
        <div className="space-y-1.5 flex-1">
          <span className="block font-mono text-[9px] tracking-[0.24em] text-cronos-bronze uppercase">
            {brandName}
          </span>

          <h3 className="font-serif text-lg sm:text-xl text-cronos-text tracking-[0.02em] leading-snug">
            <Link
              to={`/reloj/${reloj.id}`}
              className="hover:text-cronos-bronze transition-colors focus:outline-none block"
            >
              {reloj.nombre}
            </Link>
          </h3>

          <div className="font-mono text-[10px] text-cronos-muted tracking-wider pt-1">
            {reloj.movimiento_display || reloj.movimiento} &bull; {reloj.diametro_caja_mm} mm &bull; {reloj.resistencia_agua_m} m WR
          </div>
        </div>

        {/* 3. COTIZACIÓN SOBRIA */}
        <div className="pt-4 pb-4">
          <span className="font-mono text-base text-cronos-text tracking-wider font-medium block">
            {formatPrice(price)} <span className="text-xs text-cronos-muted font-normal">USD</span>
          </span>
        </div>
      </div>

      {/* 4. ACCIONES DISCRETAS */}
      <div className="pt-4 border-t border-cronos-line/60 flex items-center justify-between gap-3">
        {inStock ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(reloj, 1);
            }}
            className="text-[11px] font-sans font-medium tracking-[0.18em] text-cronos-text hover:text-cronos-bronze uppercase transition-colors cursor-pointer py-1 border-b border-cronos-line hover:border-cronos-bronze"
          >
            Añadir a la bolsa &rarr;
          </button>
        ) : (
          <span className="text-[10px] font-mono tracking-widest text-cronos-muted uppercase py-1">
            Bajo encargo
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleCompare(reloj)}
          className={`font-mono text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1.5 py-1 cursor-pointer ${
            compared
              ? 'text-cronos-bronze font-medium'
              : 'text-cronos-muted hover:text-cronos-text'
          }`}
        >
          {compared ? (
            <>
              <Check className="h-3 w-3 stroke-[2]" />
              <span>En matriz</span>
            </>
          ) : (
            <span>+ Comparar</span>
          )}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
