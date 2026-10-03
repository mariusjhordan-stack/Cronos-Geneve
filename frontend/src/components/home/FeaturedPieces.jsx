import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function FeaturedPieces({ pieces = [] }) {
  if (!pieces || pieces.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 border-b border-cronos-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="font-mono text-technical tracking-widest-brand text-cronos-bronze uppercase block mb-2">
            SÉLECTION DU MAÎTRE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.04em] mb-3">
            PIEZAS DESTACADAS
          </h2>
          <p className="text-xs sm:text-sm text-cronos-muted font-sans leading-relaxed">
            Ejemplares de manufactura seleccionados por su complejidad mecánica, pureza de calibre y disponibilidad en catálogo.
          </p>
        </div>

        {/* Galería Editorial sin tarjetas artificiales */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-y border-cronos-line">
          {pieces.map((piece) => {
            const brand = piece.marca_nombre || piece.marca_detalle?.nombre || 'Manufactura Suiza';
            const price = parseFloat(piece.precio);

            return (
              <article
                key={piece.id}
                className="group flex flex-col justify-between p-8 sm:p-10 transition-colors hover:bg-cronos-surface-2/30"
              >
                <div>
                  {/* Marca */}
                  <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block text-center mb-1.5">
                    {brand}
                  </span>

                  {/* Modelo */}
                  <h3 className="font-serif text-xl text-center text-cronos-text tracking-[0.04em] mb-6">
                    <Link
                      to={`/reloj/${piece.id}`}
                      className="hover:text-cronos-bronze transition-colors focus:outline-none"
                    >
                      {piece.nombre}
                    </Link>
                  </h3>

                  {/* Fotografía Dominante */}
                  <div className="relative aspect-[4/5] w-full flex items-center justify-center p-4 mb-6">
                    <Link
                      to={`/reloj/${piece.id}`}
                      className="flex h-full w-full items-center justify-center"
                      aria-label={`Ver detalles de ${piece.nombre}`}
                    >
                      {piece.imagen_url ? (
                        <img
                          src={piece.imagen_url}
                          alt={`${brand} ${piece.nombre}`}
                          className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-44 w-44 items-center justify-center border border-cronos-line bg-cronos-surface-2/40">
                          <span className="font-mono text-technical tracking-widest text-cronos-muted">
                            [ ARCHIVO RESERVADO ]
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Badge sutil de stock exclusivo */}
                    {piece.stock === 1 && (
                      <div className="absolute top-2 right-2">
                        <span className="font-mono text-[9px] tracking-widest text-cronos-bronze border border-cronos-bronze/40 px-2 py-0.5 bg-cronos-bg/90">
                          PIEZA ÚNICA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Especificación Técnica Compacta */}
                  <div className="text-center font-mono text-technical tracking-widest text-cronos-muted mb-3">
                    {piece.movimiento_display || piece.movimiento} &bull; {piece.diametro_caja_mm} MM
                  </div>

                  {/* Cotización Oficial */}
                  <div className="text-center font-mono text-base text-cronos-text tracking-wider mb-6">
                    {formatPrice(price)} <span className="text-[10px] text-cronos-muted">USD</span>
                  </div>
                </div>

                {/* CTA Editorial Discreto */}
                <div className="pt-2 text-center">
                  <Link
                    to={`/reloj/${piece.id}`}
                    className="inline-flex items-center gap-1.5 border-b border-cronos-bronze pb-1 text-xs font-sans tracking-[0.2em] text-cronos-text hover:text-cronos-bronze uppercase transition-colors"
                  >
                    <span>CONSULTAR FICHA TÉCNICA</span>
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
