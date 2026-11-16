import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { WatchImage } from '@/components/product/WatchImage';
import { getWatchImageSrc } from '@/lib/watchImages';

function pieceLabel(piece) {
  if (!piece) return 'Pieza del catálogo';
  const brand = piece.marca_nombre || piece.marca_detalle?.nombre || '';
  return [brand, piece.nombre].filter(Boolean).join(' · ');
}

export function HeritageEssay({ mainPiece, detailPiece }) {
  const shouldReduceMotion = useReducedMotion();
  const mainImage = getWatchImageSrc(mainPiece);
  const detailImage = getWatchImageSrc(detailPiece);

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="herencia"
      className="relative overflow-hidden border-b border-cronos-line bg-cronos-bg py-24 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado Editorial Asimétrico */}
        <motion.div
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="mb-16 max-w-3xl sm:mb-20"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-cronos-bronze/70" />
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-cronos-bronze">
              Essai Horloger · Herencia y Precisión
            </span>
          </div>

          <h2 className="mt-4 font-serif text-3xl leading-[1.08] tracking-[0.02em] text-cronos-text sm:text-5xl lg:text-6xl">
            La disciplina del{' '}
            <span className="italic font-light text-cronos-text/80">tiempo mecánico</span>
          </h2>

          <p className="mt-6 font-sans text-base leading-relaxed text-cronos-muted sm:text-lg">
            Un guardatiempo de manufactura no es un simple instrumento de medición; es un
            testimonio de física aplicada y paciencia artesanal. En una época dominada por lo
            efímero, la relojería mecánica preserva la devoción por el engranaje tallado a mano, la
            espiral paramagnética y la regulación micrométrica de la frecuencia.
          </p>
        </motion.div>

        {/* Composición asimétrica con piezas reales del catálogo */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Pieza protagonista */}
          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="space-y-8 lg:col-span-7"
          >
            <div className="group relative aspect-[6/5] w-full overflow-hidden bg-gradient-to-br from-[#ece8df] via-[#f7f5f0] to-[#e8e3da]">
              <WatchImage
                src={mainImage}
                alt={mainPiece ? `${mainPiece.marca_nombre || mainPiece.marca_detalle?.nombre || 'Reloj'} ${mainPiece.nombre}` : 'Imagen de reloj no disponible'}
                eager
                className="h-full w-full"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171717]/55 to-transparent px-5 pb-5 pt-16 sm:px-7 sm:pb-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/90">
                  {pieceLabel(mainPiece)}
                </span>
              </div>
            </div>

            <blockquote className="border-l-2 border-cronos-bronze py-2 pl-6 font-serif text-xl italic leading-relaxed text-cronos-text/95 sm:text-2xl">
              “La precisión nace de cada detalle.”
            </blockquote>

            <p className="font-sans text-sm leading-relaxed text-cronos-muted sm:text-base">
              En la relojería mecánica, el acabado de los componentes y el ajuste del movimiento
              contribuyen a la identidad de cada pieza. Los detalles y materiales varían según el
              modelo y deben consultarse en su ficha técnica.
            </p>
          </motion.div>

          {/* Segunda pieza y notas técnicas */}
          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="space-y-10 lg:col-span-5 lg:pt-12"
          >
            <div className="group relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-[#e7e4dd] via-[#f8f7f3] to-[#e9e5dc]">
              <WatchImage
                src={detailImage}
                alt={detailPiece ? `${detailPiece.marca_nombre || detailPiece.marca_detalle?.nombre || 'Reloj'} ${detailPiece.nombre}` : 'Imagen de reloj no disponible'}
                className="h-full w-full"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171717]/55 to-transparent px-4 pb-4 pt-12">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/90">
                  {pieceLabel(detailPiece)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-sans text-sm leading-relaxed text-cronos-muted sm:text-base">
                En Cronos Genève documentamos cada pieza con sus especificaciones de manufactura,
                características de caja, calibre y materiales, preservando el rigor técnico de la
                relojería tradicional.
              </p>

              {/* Pilares Factuales con microinteracción tipográfica */}
              <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="border-t border-cronos-line/80 pt-4">
                  <div className="mb-2 flex items-center gap-2.5">
                    <Award className="h-4 w-4 shrink-0 stroke-[1.4] text-cronos-bronze" />
                    <span className="font-mono text-xs uppercase tracking-widest text-cronos-text">
                      Calibre y movimiento
                    </span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed text-cronos-muted sm:text-sm">
                    Consulta en cada ficha el tipo de movimiento registrado para el modelo.
                  </p>
                </div>

                <div className="border-t border-cronos-line/80 pt-4">
                  <div className="mb-2 flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 stroke-[1.4] text-cronos-bronze" />
                    <span className="font-mono text-xs uppercase tracking-widest text-cronos-text">
                      Ficha de manufactura
                    </span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed text-cronos-muted sm:text-sm">
                    Las fichas reúnen las especificaciones disponibles de caja, cristal, resistencia
                    al agua y brazalete.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
