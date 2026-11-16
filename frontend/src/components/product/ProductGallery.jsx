import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { WatchImage } from '@/components/product/WatchImage';
import { WATCH_IMAGE_RATIO, getWatchGallery, getWatchImageAlt } from '@/lib/watchImages';

const SWIPE_THRESHOLD = 48;

/**
 * Galería de la ficha: imagen principal 4:5, miniaturas, fundido entre vistas,
 * zoom con el cursor (escritorio) y visor a pantalla completa con zoom por toque (móvil).
 * `children` se pinta como overlay (insignias de stock) sobre la imagen principal.
 */
export function ProductGallery({ reloj, children }) {
  const images = getWatchGallery(reloj);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [prevId, setPrevId] = useState(reloj.id);
  const touchStart = useRef(null);
  const reduceMotion = useReducedMotion();

  if (reloj.id !== prevId) {
    setPrevId(reloj.id);
    setIndex(0);
    setLightbox(false);
  }

  const count = images.length;
  const active = images[index] || images[0] || null;
  const alt = active?.alt || getWatchImageAlt(reloj);

  const go = useCallback(
    (delta) => {
      if (count <= 1) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, go]);

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
    setZoomed(true);
  };

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className="flex flex-col">
      {/* Imagen principal: 4:5 y, en pantallas altas, nunca más alta que el viewport */}
      <div
        className="group relative mx-auto w-full overflow-hidden bg-[#FAF8F4]"
        style={{ aspectRatio: WATCH_IMAGE_RATIO, maxWidth: 'min(100%, calc(86vh * 0.8))' }}
      >
        <button
          type="button"
          onClick={() => { setZoomed(false); setLightbox(true); }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setZoomed(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="absolute inset-0 block h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text"
          aria-label="Ampliar imagen"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active?.url || `placeholder-${reloj.id}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative h-full w-full"
            >
              <WatchImage
                src={active?.url}
                alt={alt}
                eager
                className="h-full w-full"
                imgClassName="transition-[transform,opacity] duration-300 ease-out"
              />
              {/* Capa de zoom: misma imagen ampliada 2x desde el punto del cursor (solo con ratón) */}
              <div
                className={`pointer-events-none absolute inset-0 hidden bg-[#FAF8F4] transition-opacity duration-200 md:block ${
                  zoomed && active?.url ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: active?.url ? `url("${active.url}")` : undefined,
                  backgroundSize: '200%',
                  backgroundPosition: origin,
                  backgroundRepeat: 'no-repeat',
                }}
                aria-hidden="true"
              />
            </motion.div>
          </AnimatePresence>
        </button>

        <span className="pointer-events-none absolute left-3 top-3 hidden items-center gap-1.5 bg-white/85 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-cronos-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
          <ZoomIn className="h-3 w-3" aria-hidden="true" /> Ampliar
        </span>

        {active?.esIlustracion && (
          <span className="pointer-events-none absolute bottom-3 left-3 bg-white/90 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-cronos-muted">
            Ilustración · fotografía en preparación
          </span>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer bg-white/80 p-2.5 text-cronos-muted backdrop-blur-xs transition-colors hover:text-cronos-text focus:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-white/80 p-2.5 text-cronos-muted backdrop-blur-xs transition-colors hover:text-cronos-text focus:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4 stroke-[1.5]" />
            </button>
            <div className="pointer-events-none absolute bottom-3 right-3 select-none bg-white/90 px-2.5 py-1 font-mono text-[11px] tracking-widest text-cronos-muted">
              {index + 1} / {count}
            </div>
          </>
        )}

        <div className="absolute right-4 top-4">{children}</div>
      </div>

      {/* Miniaturas 4:5; en móvil se desplazan con scroll-snap */}
      {count > 1 && (
        <div className="mx-auto mt-4 flex w-full snap-x snap-mandatory items-center gap-3 overflow-x-auto pb-1" style={{ maxWidth: 'min(100%, calc(86vh * 0.8))' }}>
          {images.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-20 w-16 shrink-0 snap-start cursor-pointer overflow-hidden bg-[#FAF8F4] transition-opacity duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text ${
                i === index ? 'opacity-100 ring-1 ring-cronos-text' : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ver imagen ${i + 1} de ${count}`}
              aria-current={i === index}
            >
              <WatchImage src={item.urlCard} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      {/* Visor a pantalla completa: toque/clic alterna entre ajustar y ampliar */}
      {lightbox && active && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#171717]/95"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada: ${alt}`}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white/80">
            <span className="font-mono text-xs tracking-widest">{index + 1} / {count}</span>
            <button
              type="button"
              onClick={() => { setZoomed(false); setLightbox(false); }}
              className="cursor-pointer p-2 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              aria-label="Cerrar visor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1 overflow-auto" onTouchStart={onTouchStart} onTouchEnd={zoomed ? undefined : onTouchEnd}>
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className={`mx-auto block h-full focus:outline-none ${zoomed ? 'w-[200%] max-w-none cursor-zoom-out md:w-[150%]' : 'w-full cursor-zoom-in'}`}
              aria-label={zoomed ? 'Reducir imagen' : 'Ampliar imagen'}
            >
              <img src={active.url} alt={alt} className="mx-auto h-full w-full object-contain" />
            </button>
            {count > 1 && !zoomed && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none" aria-label="Imagen anterior">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none" aria-label="Imagen siguiente">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
