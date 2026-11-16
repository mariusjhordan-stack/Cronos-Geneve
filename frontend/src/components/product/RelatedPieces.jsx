import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { formatPrice } from '@/lib/utils';
import { getWatchImageSrc } from '@/lib/watchImages';
import { Button } from '@/components/ui/Button';
import { WatchImage } from '@/components/product/WatchImage';

const MOTIVOS = {
  casa_calibre: 'Casa y calibre',
  casa: 'Misma casa',
  calibre: 'Mismo calibre',
};

// Móvil: carrusel con scroll-snap. Desde sm: grilla auto-fill de tarjetas de mínimo 240px.
const LIST_CLASSES =
  '-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 ' +
  'sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0';
const ITEM_CLASSES = 'w-[72%] shrink-0 snap-start sm:w-auto';

function RelatedSkeleton() {
  return (
    <div className={LIST_CLASSES} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`${ITEM_CLASSES} animate-pulse`}>
          <div className="aspect-[4/5] w-full bg-cronos-surface-2" />
          <div className="mt-4 h-3 w-1/3 bg-cronos-surface-2" />
          <div className="mt-3 h-4 w-3/4 bg-cronos-surface-2" />
          <div className="mt-3 h-3 w-1/2 bg-cronos-surface-2" />
        </div>
      ))}
    </div>
  );
}

function RelatedCard({ piece }) {
  const brand = piece.marca_nombre || piece.marca_detalle?.nombre || 'Manufactura';
  const soldOut = !piece.en_stock;
  const motivo = MOTIVOS[piece.motivo];

  return (
    <li className={ITEM_CLASSES}>
      <Link
        to={`/reloj/${piece.id}`}
        className="group block focus:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text"
        aria-label={`Ver ficha de ${brand} ${piece.nombre}`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-cronos-surface-1 via-[#f5f3ee] to-cronos-surface-2">
          <WatchImage
            src={getWatchImageSrc(piece)}
            alt={`${brand} ${piece.nombre}`}
            className="h-full w-full"
            imgClassName={`transition-transform duration-500 ease-out group-hover:scale-[1.04] ${soldOut ? 'opacity-60' : ''}`}
          />
          {motivo && (
            <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-cronos-bronze">
              {motivo}
            </span>
          )}
          {soldOut && (
            <span className="absolute right-3 top-3 bg-red-700 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-white">
              Agotado
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-cronos-text/90 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            Ver ficha →
          </span>
        </div>
        <div className="mt-4">
          <span className="block font-mono text-[11px] uppercase tracking-widest text-cronos-muted">{brand}</span>
          <h3 className="mt-1 font-serif text-lg font-normal leading-snug text-cronos-text">{piece.nombre}</h3>
          <span className="mt-1 block font-mono text-sm text-cronos-text">{formatPrice(piece.precio)} USD</span>
        </div>
      </Link>
    </li>
  );
}

export function RelatedPieces({ relojId }) {
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getRecomendaciones(relojId)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', items: Array.isArray(data) ? data : data.results || [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [relojId, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading', items: [] });
    setAttempt((n) => n + 1);
  }, []);

  if (state.status === 'success' && state.items.length === 0) return null;

  return (
    <section className="border-t border-cronos-line pt-12" aria-labelledby="related-title">
      <div className="mb-8">
        <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest-brand text-cronos-bronze">
          Selección paralela
        </span>
        <h2 id="related-title" className="font-serif text-2xl font-normal text-cronos-text sm:text-3xl">
          Piezas de la misma casa y calibre
        </h2>
      </div>

      {state.status === 'loading' && <RelatedSkeleton />}

      {state.status === 'error' && (
        <div role="alert" className="flex flex-col items-start gap-3 bg-cronos-surface-1 p-6">
          <p className="text-sm text-cronos-muted">No pudimos cargar las recomendaciones.</p>
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reintentar
          </Button>
        </div>
      )}

      {state.status === 'success' && (
        <ul className={LIST_CLASSES}>
          {state.items.map((piece) => (
            <RelatedCard key={piece.id} piece={piece} />
          ))}
        </ul>
      )}
    </section>
  );
}
