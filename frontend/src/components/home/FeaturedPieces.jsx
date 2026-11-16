import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { formatPrice } from '@/lib/utils';
import { WatchImage } from '@/components/product/WatchImage';
import { getWatchImageSrc } from '@/lib/watchImages';

export function FeaturedPieces({ pieces = [] }) {
  const shouldReduceMotion = useReducedMotion();
  if (!pieces || pieces.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.14,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden border-b border-cronos-line bg-cronos-bg py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-20 max-w-2xl text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-cronos-bronze/70" />
            <span className="font-mono text-technical uppercase tracking-widest-brand text-cronos-bronze">
              Selección destacada · Relojería
            </span>
            <span className="h-px w-6 bg-cronos-bronze/70" />
          </div>

          <h2 className="font-serif text-3xl tracking-[0.02em] text-cronos-text sm:text-4xl lg:text-5xl">
            Piezas destacadas
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-cronos-muted sm:text-base">
            Ejemplares de manufactura seleccionados por su complejidad mecánica, pureza de calibre y
            disponibilidad en catálogo.
          </p>
        </motion.div>

        {/* Galería Asimétrica con ritmo visual */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 items-start gap-14 md:grid-cols-[1.1fr_0.9fr_1fr] md:gap-10"
        >
          {pieces.map((piece, idx) => {
            const brand =
              piece.marca_nombre || piece.marca_detalle?.nombre || 'Manufactura Suiza';
            const price = parseFloat(piece.precio);
            const imageSrc = getWatchImageSrc(piece);

            // Ritmo asimétrico: el elemento central tiene un ligero desfase vertical para romper la cuadrícula rígida
            const isCenterPiece = idx === 1;

            return (
              <motion.article
                key={piece.id}
                variants={itemVariants}
                className={`group flex flex-col justify-between ${
                  isCenterPiece ? 'md:-translate-y-4' : ''
                }`}
              >
                <div>
                  <Link
                    to={`/reloj/${piece.id}`}
                    className={`relative mb-6 block w-full overflow-hidden bg-gradient-to-br from-cronos-surface-1 via-[#f5f3ee] to-cronos-surface-2 transition-colors ${idx === 1 ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}
                    aria-label={`Ver detalles de ${piece.nombre}`}
                  >
                    <WatchImage
                      src={imageSrc}
                      alt={`${brand} ${piece.nombre}`}
                      className="h-full w-full"
                      imgClassName={shouldReduceMotion ? '' : 'transition-transform duration-700 ease-out group-hover:scale-[1.04]'}
                    />
                    {piece.stock === 1 && (
                      <span className="absolute right-3 top-3 bg-white/90 px-2.5 py-0.5 font-mono text-[9px] tracking-widest text-cronos-bronze uppercase">
                        Pieza única
                      </span>
                    )}

                    <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-widest text-cronos-muted/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      N° 0{idx + 1}
                    </div>
                  </Link>

                  <span className="mb-1.5 block text-center font-mono text-[10px] uppercase tracking-[0.28em] text-cronos-bronze">
                    {brand}
                  </span>

                  <h3 className="mb-3 text-center font-serif text-xl tracking-[0.02em] text-cronos-text sm:text-2xl">
                    <Link
                      to={`/reloj/${piece.id}`}
                      className="transition-colors duration-200 hover:text-cronos-bronze focus:outline-none"
                    >
                      {piece.nombre}
                    </Link>
                  </h3>

                  <div className="mb-3 text-center font-mono text-[11px] tracking-widest text-cronos-muted">
                    {piece.movimiento_display || piece.movimiento} · {piece.diametro_caja_mm} MM
                  </div>

                  <div className="mb-6 text-center font-mono text-base tracking-wider text-cronos-text">
                    {formatPrice(price)}{' '}
                    <span className="text-[10px] text-cronos-muted">USD</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to={`/reloj/${piece.id}`}
                    className="group/link inline-flex items-center gap-2 border-b border-cronos-bronze pb-1 text-xs uppercase tracking-[0.22em] text-cronos-text transition-colors hover:text-cronos-bronze"
                  >
                    <span>Consultar ficha</span>
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedPieces;
