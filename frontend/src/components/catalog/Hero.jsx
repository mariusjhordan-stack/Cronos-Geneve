import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { formatPrice } from '@/lib/utils';
import { WatchImage } from '@/components/product/WatchImage';

export function Hero({ protagonistPiece, totalPiezas = 0 }) {
  const brandName =
    protagonistPiece?.marca_nombre ||
    protagonistPiece?.marca_detalle?.nombre ||
    'Manufactura';
  const watchName = protagonistPiece?.nombre || 'Pieza de Alta Relojería';
  const imgUrl = protagonistPiece?.imagen_url;
  const price = protagonistPiece?.precio ? parseFloat(protagonistPiece.precio) : null;

  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const watchEntrance = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: shouldReduceMotion ? 0 : 0.2 },
    },
  };

  return (
    <section className="relative overflow-hidden border-b border-cronos-line bg-cronos-bg py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Columna Izquierda: Manifiesto Editorial y Tipografía Cinematográfica */}
          <motion.div
            variants={containerVariants}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            className="lg:col-span-6"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <span className="h-px w-6 bg-cronos-bronze" />
              <span className="font-mono text-[11px] uppercase tracking-[0.34em] text-cronos-bronze">
                Cronos Genève · Haute Horlogerie
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-5 font-serif text-4xl leading-[1.04] tracking-[0.01em] text-cronos-text sm:text-6xl lg:text-[4.4rem]"
            >
              Precisión mecánica
              <span className="mt-1 block italic font-light text-cronos-text/75">
                y diseño atemporal
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-xl font-sans text-base leading-relaxed text-cronos-muted sm:text-lg"
            >
              Una selección de relojes con fichas técnicas para explorar sus características,
              comparar modelos y consultar la disponibilidad registrada.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8">
              <a
                href="#catalogo"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex cursor-pointer items-center justify-center bg-[#171717] px-8 py-4 text-xs uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-[#2B2B2B]"
              >
                <span>Explorar catálogo</span>
                <ArrowRight className="ml-2.5 h-3.5 w-3.5 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <Link
                to="/comparador"
                className="group relative py-2 font-mono text-xs uppercase tracking-[0.24em] text-cronos-muted transition-colors hover:text-cronos-text"
              >
                <span>Matriz comparativa</span>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-cronos-text transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>

            {/* Ficha de datos editoriales */}
            <motion.div
              variants={itemVariants}
              className="mt-14 grid grid-cols-1 gap-8 border-t border-cronos-line/80 pt-8 sm:grid-cols-3"
            >
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-cronos-muted">
                  Disciplina
                </span>
                <span className="block font-serif text-lg text-cronos-text">
                  Haute Horlogerie
                </span>
              </div>
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-cronos-muted">
                  Calibres
                </span>
                  <span className="block font-serif text-lg text-cronos-text">
                    Datos por modelo
                  </span>
              </div>
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-cronos-muted">
                  Inventario
                </span>
                <span className="block font-serif text-lg text-cronos-text">
                  {totalPiezas > 0 ? `${totalPiezas} piezas en bóveda` : 'Colección curada'}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Columna Derecha: Escaparate de la Pieza Protagonista */}
          <motion.div
            variants={watchEntrance}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            className="lg:col-span-6"
          >
            {protagonistPiece ? (
              <Link
                to={`/reloj/${protagonistPiece.id}`}
                className="group relative block w-full focus:outline-none"
                aria-label={`Ver pieza destacada: ${brandName} ${watchName}`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-cronos-surface-1 transition-colors sm:aspect-square">
                  {imgUrl ? (
                    <WatchImage
                      src={imgUrl}
                      alt={`${brandName} ${watchName}`}
                      eager
                      className="watch-stage--hero absolute inset-0 h-full w-full bg-transparent"
                      imgClassName="transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-cronos-muted">
                        Archivo en registro
                      </span>
                    </div>
                  )}

                  {/* Descriptor editorial sin afirmar procedencia */}
                  <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.2em] text-cronos-muted/70">
                    Selección editorial
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4 border-b border-cronos-line/60 pb-3">
                  <div>
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.28em] text-cronos-bronze">
                      {brandName}
                    </span>
                    <span className="font-serif text-2xl text-cronos-text transition-colors group-hover:text-cronos-bronze sm:text-3xl">
                      {watchName}
                    </span>
                  </div>
                  {price && (
                    <span className="shrink-0 font-mono text-base tracking-wider text-cronos-text">
                      {formatPrice(price)} <span className="text-[10px] text-cronos-muted">USD</span>
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center bg-cronos-surface-1 p-8 text-center">
                <span className="mb-2 block font-mono text-[9px] uppercase tracking-widest-brand text-cronos-bronze">
                  Catálogo editorial
                </span>
                <span className="mb-2 font-serif text-xl text-cronos-text">
                  Selección de relojes
                </span>
                <span className="font-mono text-technical text-cronos-muted">
                  Cargando piezas desde el catálogo...
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
