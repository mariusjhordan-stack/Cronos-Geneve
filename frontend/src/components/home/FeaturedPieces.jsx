import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { WatchImage } from '@/components/product/WatchImage';

export function FeaturedPieces({ pieces = [] }) {
  if (!pieces || pieces.length === 0) return null;

  return (
    <section className="border-b border-cronos-line py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-3 block font-mono text-technical uppercase tracking-widest-brand text-cronos-bronze">
            Sélection du maître
          </span>
          <h2 className="mb-4 font-serif text-3xl tracking-[0.04em] text-cronos-text sm:text-4xl">
            Piezas destacadas
          </h2>
          <p className="font-sans text-sm leading-relaxed text-cronos-muted sm:text-base">
            Ejemplares de manufactura seleccionados por su complejidad mecánica, pureza de calibre y disponibilidad en catálogo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          {pieces.map((piece) => {
            const brand = piece.marca_nombre || piece.marca_detalle?.nombre || 'Manufactura Suiza';
            const price = parseFloat(piece.precio);

            return (
              <article
                key={piece.id}
                className="group flex flex-col justify-between"
              >
                <div>
                  <Link
                    to={`/reloj/${piece.id}`}
                    className="relative mb-6 block aspect-[4/5] w-full overflow-hidden bg-cronos-surface-1"
                    aria-label={`Ver detalles de ${piece.nombre}`}
                  >
                    {piece.imagen_url ? (
                      <WatchImage
                        src={piece.imagen_url}
                        alt={`${brand} ${piece.nombre}`}
                        className="h-full w-full"
                        imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-mono text-technical tracking-widest text-cronos-muted">
                          Archivo reservado
                        </span>
                      </div>
                    )}
                    {piece.stock === 1 && (
                      <span className="absolute right-3 top-3 bg-white/90 px-2 py-0.5 font-mono text-[9px] tracking-widest text-cronos-bronze uppercase">
                        Pieza única
                      </span>
                    )}
                  </Link>

                  <span className="mb-1.5 block text-center font-mono text-[10px] uppercase tracking-[0.28em] text-cronos-bronze">
                    {brand}
                  </span>

                  <h3 className="mb-4 text-center font-serif text-xl tracking-[0.03em] text-cronos-text">
                    <Link
                      to={`/reloj/${piece.id}`}
                      className="transition-colors hover:text-cronos-bronze focus:outline-none"
                    >
                      {piece.nombre}
                    </Link>
                  </h3>

                  <div className="mb-3 text-center font-mono text-[11px] tracking-widest text-cronos-muted">
                    {piece.movimiento_display || piece.movimiento} · {piece.diametro_caja_mm} MM
                  </div>

                  <div className="mb-6 text-center font-mono text-base tracking-wider text-cronos-text">
                    {formatPrice(price)} <span className="text-[10px] text-cronos-muted">USD</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to={`/reloj/${piece.id}`}
                    className="inline-flex items-center gap-1.5 border-b border-cronos-bronze pb-1 text-xs uppercase tracking-[0.2em] text-cronos-text transition-colors hover:text-cronos-bronze"
                  >
                    <span>Consultar ficha</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
