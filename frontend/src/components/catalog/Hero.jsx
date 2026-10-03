import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
    <section className="relative overflow-hidden border-b border-cronos-line bg-cronos-bg py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Columna Izquierda: Manifiesto Editorial y Especificaciones (7 cols) */}
          <div className="lg:col-span-7">
            <span className="font-mono text-[10px] tracking-[0.28em] text-cronos-bronze uppercase block mb-4">
              CRONOS GENÈVE &bull; CATÁLOGO EDITORIAL
            </span>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-cronos-text tracking-[0.02em] leading-[1.05] mb-6">
              Precisión mecánica <br />
              <span className="italic font-light text-cronos-text/80">y diseño atemporal</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-cronos-muted leading-relaxed font-sans mb-10 font-normal">
              Colección selecta de guardatiempos de alta gama. Fichas técnicas rigurosas, calibres históricos y documentación detallada por cada pieza registrada.
            </p>

            {/* Acciones de Navegación Editorial */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <a
                href="#catalogo"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center bg-[#171717] text-white px-7 py-3.5 text-xs font-sans tracking-[0.2em] uppercase hover:bg-[#2B2B2B] transition-colors cursor-pointer"
              >
                <span>EXPLORAR CATÁLOGO</span>
                <ArrowRight className="ml-2.5 h-3.5 w-3.5 stroke-[1.5]" />
              </a>

              <Link
                to="/comparador"
                className="text-xs font-sans tracking-[0.2em] text-cronos-muted hover:text-cronos-text uppercase transition-colors py-2 border-b border-transparent hover:border-cronos-text"
              >
                MATRIZ COMPARATIVA
              </Link>
            </div>

            {/* Tira Técnica de Especificaciones Editoriales con profundidad marfil */}
            <div className="mt-14 pt-6 border-t border-cronos-line grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-cronos-line bg-cronos-surface-1 p-3.5 shadow-xs">
                <span className="block font-mono text-[9px] tracking-[0.2em] text-cronos-muted uppercase mb-1">
                  DISCIPLINA
                </span>
                <span className="font-mono text-xs text-cronos-text tracking-wider uppercase block font-medium">
                  Haute Horlogerie
                </span>
              </div>
              <div className="border border-cronos-line bg-cronos-surface-1 p-3.5 shadow-xs">
                <span className="block font-mono text-[9px] tracking-[0.2em] text-cronos-muted uppercase mb-1">
                  CALIBRES
                </span>
                <span className="font-mono text-xs text-cronos-text tracking-wider uppercase block font-medium">
                  Automático &bull; Manual
                </span>
              </div>
              <div className="border border-cronos-line bg-cronos-surface-1 p-3.5 shadow-xs">
                <span className="block font-mono text-[9px] tracking-[0.2em] text-cronos-muted uppercase mb-1">
                  INVENTARIO
                </span>
                <span className="font-mono text-xs text-cronos-text tracking-wider block font-medium">
                  {totalPiezas > 0 ? `${totalPiezas} PIEZAS REGISTRADAS` : '24 PIEZAS REGISTRADAS'}
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Reloj Protagonista y Multimedia (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {protagonistPiece ? (
              <Link
                to={`/reloj/${protagonistPiece.id}`}
                className="group relative block w-full max-w-md focus:outline-none"
                aria-label={`Ver pieza destacada: ${brandName} ${watchName}`}
              >
                {/* Lienzo multimedia protagonista con soporte de video y poster */}
                <div className="relative aspect-[4/5] sm:aspect-square w-full bg-cronos-surface-1 border border-cronos-line overflow-hidden flex items-center justify-center p-8 sm:p-12 transition-all duration-300 group-hover:border-cronos-text/40 shadow-xs">
                  {/* Capa de video editorial o poster de alta relojería */}
                  {!videoError && !prefersReducedMotion ? (
                    <video
                      ref={videoRef}
                      src="/videos/hero-horology.mp4"
                      poster="/images/hero-horology-poster.jpg"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={() => setVideoError(true)}
                      className="absolute inset-0 h-full w-full object-cover opacity-85 transition-opacity duration-700 pointer-events-none"
                    />
                  ) : (
                    <img
                      src="/images/hero-horology-poster.jpg"
                      alt="Mecanismo Horológico Suizo"
                      className="absolute inset-0 h-full w-full object-cover opacity-80 pointer-events-none"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {/* Velo degradado sutil para asegurar contraste con la pieza */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cronos-surface-1/90 via-cronos-surface-1/40 to-transparent pointer-events-none" />

                  {/* Silueta de la pieza protagonista */}
                  {imgUrl ? (
                    <div className="relative z-10 p-4 flex items-center justify-center h-full w-full">
                      <img
                        src={imgUrl}
                        alt={`${brandName} ${watchName}`}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="eager"
                      />
                    </div>
                  ) : (
                    <div className="relative z-10 flex h-56 w-56 items-center justify-center border border-cronos-line bg-white/90 backdrop-blur-[2px]">
                      <span className="font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                        [ ARCHIVO EN REGISTRO ]
                      </span>
                    </div>
                  )}
                </div>

                {/* Ficha editorial descriptiva al pie */}
                <div className="mt-4 flex items-baseline justify-between border-b border-cronos-line/60 pb-2">
                  <div>
                    <span className="font-mono text-[9px] tracking-[0.24em] text-cronos-bronze uppercase block mb-0.5">
                      {brandName}
                    </span>
                    <span className="font-serif text-lg text-cronos-text group-hover:text-cronos-bronze transition-colors">
                      {watchName}
                    </span>
                  </div>
                  {price && (
                    <span className="font-mono text-sm text-cronos-text tracking-wider font-medium">
                      {formatPrice(price)} <span className="text-[10px] text-cronos-muted font-normal">USD</span>
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="relative aspect-square w-full max-w-md flex flex-col items-center justify-center border border-cronos-line bg-cronos-surface-1 p-8 text-center shadow-xs">
                <span className="font-mono text-[9px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
                  CATÁLOGO EDITORIAL
                </span>
                <span className="font-serif text-xl text-cronos-text mb-2">
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
