import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { WatchImage } from '@/components/product/WatchImage';
import { getWatchImageSrc } from '@/lib/watchImages';

const CARD_LAYOUTS = {
  single: { column: 'xl:col-span-8 xl:col-start-3', image: 'xl:aspect-[5/4]' },
  pair: { column: 'xl:col-span-6', image: 'xl:aspect-[4/5]' },
  lead: { column: 'xl:col-span-5', image: 'xl:aspect-[6/5]' },
  middle: { column: 'xl:col-span-4', image: 'xl:aspect-[4/5]' },
  narrow: { column: 'xl:col-span-3', image: 'xl:aspect-[3/4]' },
};

export function ProductCard({ reloj, layoutVariant = 'middle' }) {
  const { addToCart } = useCart();
  const { toggleCompare, isCompared } = useCompare();
  const { isFavorite, toggleFavorite, isProcessing } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

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

  const cardImage = getWatchImageSrc(reloj);
  const layout = CARD_LAYOUTS[layoutVariant] || CARD_LAYOUTS.middle;

  return (
    <motion.article
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative col-span-1 flex h-full flex-col justify-between bg-transparent px-1 py-4 sm:py-6 xl:py-8 ${layout.column}`}
    >
      <div className="flex flex-1 flex-col">
        <div className={`relative mb-7 aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-cronos-surface-1 via-[#f5f3ee] to-cronos-surface-2 ${layout.image}`}>
          <Link
            to={`/reloj/${reloj.id}`}
            className="absolute inset-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text"
            aria-label={`Ver detalles de ${reloj.nombre}`}
          >
            <WatchImage
              src={cardImage}
              alt={`${brandName} ${reloj.nombre}`}
              className="h-full w-full"
              imgClassName={shouldReduceMotion ? '' : 'transition-transform duration-700 ease-out group-hover:scale-[1.04]'}
            />
          </Link>

          <button
            type="button"
            disabled={processingFav}
            onClick={handleToggleFavorite}
            aria-label={
              isFav
                ? `Retirar ${reloj.nombre} de favoritos privados`
                : `Añadir ${reloj.nombre} a favoritos privados`
            }
            title={isFav ? 'En favoritos privados' : 'Añadir a favoritos privados'}
            className="absolute right-3 top-3 cursor-pointer p-2 text-cronos-muted transition-all duration-200 hover:scale-110 hover:text-cronos-bronze focus:outline-none disabled:opacity-50"
          >
            <Heart
              className={`h-4 w-4 stroke-[1.4] transition-colors duration-200 ${
                isFav ? 'fill-cronos-bronze text-cronos-bronze' : ''
              }`}
            />
          </button>

          <div className="pointer-events-none absolute bottom-3 left-3">
            {!inStock && (
              <span className="bg-white/90 px-2 py-0.5 font-mono text-[9px] tracking-widest text-red-700 uppercase">
                Agotado
              </span>
            )}
            {inStock && reloj.stock === 1 && (
              <span className="bg-white/90 px-2 py-0.5 font-mono text-[9px] tracking-widest text-cronos-bronze uppercase">
                Pieza única
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-cronos-bronze">
            {brandName}
          </span>

          <h3 className="font-serif text-xl leading-snug tracking-[0.02em] text-cronos-text sm:text-[1.35rem]">
            <Link
              to={`/reloj/${reloj.id}`}
              className="block transition-colors duration-200 hover:text-cronos-bronze focus:outline-none"
            >
              {reloj.nombre}
            </Link>
          </h3>

          <div className="pt-1 font-mono text-[11px] tracking-wider text-cronos-muted">
            {reloj.movimiento_display || reloj.movimiento} · {reloj.diametro_caja_mm} mm ·{' '}
            {reloj.resistencia_agua_m} m WR
          </div>
        </div>

        <div className="pb-5 pt-5">
          <span className="block font-mono text-base font-medium tracking-wider text-cronos-text">
            {formatPrice(price)} <span className="text-xs font-normal text-cronos-muted">USD</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-cronos-line/70 pt-4">
        {inStock ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(reloj, 1);
            }}
            className="group/btn relative cursor-pointer py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-cronos-text transition-colors hover:text-cronos-bronze"
          >
            <span>Añadir a la bolsa</span>
            <span className="absolute bottom-0 left-0 h-px w-0 bg-cronos-bronze transition-all duration-300 group-hover/btn:w-full" />
          </button>
        ) : (
          <span className="py-1 font-mono text-[10px] uppercase tracking-widest text-cronos-muted">
            Bajo encargo
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleCompare(reloj)}
          className={`flex cursor-pointer items-center gap-1.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            compared
              ? 'font-medium text-cronos-bronze'
              : 'text-cronos-muted hover:text-cronos-text'
          }`}
        >
          {compared ? (
            <>
              <Check className="h-3 w-3 stroke-[2]" />
              <span>En matriz</span>
            </>
          ) : (
            <span>Comparar</span>
          )}
        </button>
      </div>
    </motion.article>
  );
}

export default ProductCard;
