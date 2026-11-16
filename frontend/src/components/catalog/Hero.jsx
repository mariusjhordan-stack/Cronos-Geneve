import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { WatchImage } from '@/components/product/WatchImage';

export function Hero({ protagonistPiece, totalPiezas = 0 }) {
  const brandName = protagonistPiece?.marca_nombre || protagonistPiece?.marca_detalle?.nombre || 'Manufactura Suiza';
  const watchName = protagonistPiece?.nombre || 'Pieza de Alta Relojería';
  const imgUrl = protagonistPiece?.imagen_url;
  const price = protagonistPiece?.precio ? parseFloat(protagonistPiece.precio) : null;

  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  ));
  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-cronos-line bg-cronos-bg py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <span className="mb-5 block font-mono text-[11px] uppercase tracking-[0.32em] text-cronos-bronze">
              Cronos Genève · Genève
            </span>

            <h1 className="mb-6 font-serif text-4xl leading-[1.05] tracking-[0.01em] text-cronos-text sm:text-6xl lg:text-[4.25rem]">
              Precisión mecánica
              <span className="mt-1 block italic font-light text-cronos-text/75">y diseño atemporal</span>
            </h1>

            <p className="mb-10 max-w-xl font-sans text-base leading-relaxed text-cronos-muted">
              Colección selecta de guardatiempos de alta gama. Fichas técnicas rigurosas, calibres históricos y documentación detallada por cada pieza registrada.
            </p>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <a
                href="#catalogo"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex cursor-pointer items-center justify-center bg-[#171717] px-8 py-4 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2B2B2B]"
              >
                <span>Explorar catálogo</span>
                <ArrowRight className="ml-2.5 h-3.5 w-3.5 stroke-[1.5]" />
              </a>

              <Link
                to="/comparador"
                className="border-b border-transparent py-2 text-xs uppercase tracking-[0.22em] text-cronos-muted transition-colors hover:border-cronos-text hover:text-cronos-text"
              >
                Comparador
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-8 border-t border-cronos-line pt-8 sm:grid-cols-3">
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-cronos-muted">
                  Disciplina
                </span>
                <span className="block font-serif text-lg text-cronos-text">
                  Haute Horlogerie
                </span>
              </div>
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-cronos-muted">
                  Calibres
                </span>
                <span className="block font-serif text-lg text-cronos-text">
                  Automático y manual
                </span>
              </div>
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-cronos-muted">
                  Inventario
                </span>
                <span className="block font-serif text-lg text-cronos-text">
                  {totalPiezas > 0 ? `${totalPiezas} piezas` : 'Colección'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            {protagonistPiece ? (
              <Link
                to={`/reloj/${protagonistPiece.id}`}
                className="group relative block w-full focus:outline-none"
                aria-label={`Ver pieza destacada: ${brandName} ${watchName}`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-cronos-surface-1 sm:aspect-square">
                  {!videoError && !prefersReducedMotion && (
                    <video
                      ref={videoRef}
                      src="/videos/hero-horology.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={() => setVideoError(true)}
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
                    />
                  )}
                  {imgUrl ? (
                    <WatchImage
                      src={imgUrl}
                      alt={`${brandName} ${watchName}`}
                      eager
                      className="watch-stage--hero absolute inset-0 h-full w-full bg-transparent"
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-cronos-muted">
                        Archivo en registro
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.28em] text-cronos-bronze">
                      {brandName}
                    </span>
                    <span className="font-serif text-2xl text-cronos-text transition-colors group-hover:text-cronos-bronze">
                      {watchName}
                    </span>
                  </div>
                  {price && (
                    <span className="shrink-0 font-mono text-sm tracking-wider text-cronos-text">
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
                  Alta Relojería Suiza
                </span>
                <span className="font-mono text-technical text-cronos-muted">
                  Cargando piezas desde el catálogo...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
