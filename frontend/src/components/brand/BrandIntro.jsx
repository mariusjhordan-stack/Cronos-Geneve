import React, { useState, useEffect, useRef, useCallback } from 'react';

const INTRO_SEEN_KEY = 'cronos_intro_seen';
const DISPLAY_DURATION_MS = 1850;
const FADE_OUT_DURATION_MS = 400;

export function BrandIntro() {
  const [isMounted, setIsMounted] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const seen = sessionStorage.getItem(INTRO_SEEN_KEY);
      if (seen === 'true') {
        return false;
      }
      sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
      return true;
    } catch {
      return false;
    }
  });

  const [isExiting, setIsExiting] = useState(false);
  const isExitingRef = useRef(false);
  const dismissTimerRef = useRef(null);
  const unmountTimerRef = useRef(null);

  const handleDismiss = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);

    unmountTimerRef.current = setTimeout(() => {
      setIsMounted(false);
    }, FADE_OUT_DURATION_MS);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Bloquear scroll de forma segura mientras la intro está activa
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Manejo de prefers-reduced-motion: salida casi instantánea
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      unmountTimerRef.current = setTimeout(() => {
        setIsMounted(false);
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
      };
    }

    // Cerrar con tecla Escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Ciclo natural de animación y transición
    dismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, DISPLAY_DURATION_MS);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
    };
  }, [isMounted, handleDismiss]);

  if (!isMounted) {
    return null;
  }

  // 12 marcas horarias (ángulos de 0° a 330° en pasos de 30°)
  const hourAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div
      role="dialog"
      aria-label="Presentación de Cronos Genève"
      aria-modal="true"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#171717] px-4 transition-opacity select-none cursor-pointer ${
        isExiting
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100'
      }`}
      style={{
        transitionDuration: `${FADE_OUT_DURATION_MS}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="flex flex-col items-center justify-center max-w-sm w-full">
        {/* Esfera Horológica Minimalista (SVG Vectorial) */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 animate-intro-dial">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bisel exterior sutil */}
            <circle
              cx="80"
              cy="80"
              r="74"
              stroke="#A58A68"
              strokeOpacity="0.22"
              strokeWidth="0.75"
            />

            {/* Anillo de minutos concéntrico */}
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="#FAF9F6"
              strokeOpacity="0.12"
              strokeWidth="0.5"
              strokeDasharray="1.5 3"
            />

            {/* 12 Índices Horarios */}
            {hourAngles.map((deg) => {
              const isCardinal = deg % 90 === 0;
              return (
                <line
                  key={deg}
                  x1="80"
                  y1={isCardinal ? '10' : '13'}
                  x2="80"
                  y2={isCardinal ? '19' : '17'}
                  stroke={isCardinal ? '#A58A68' : '#FAF9F6'}
                  strokeOpacity={isCardinal ? '0.9' : '0.4'}
                  strokeWidth={isCardinal ? '1.25' : '0.75'}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 80 80)`}
                />
              );
            })}

            {/* Aguja de las horas (~10:10 editorial) */}
            <line
              x1="80"
              y1="80"
              x2="80"
              y2="46"
              stroke="#D8D4CC"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform="rotate(305 80 80)"
            />

            {/* Aguja de los minutos (~10:10 editorial) */}
            <line
              x1="80"
              y1="80"
              x2="80"
              y2="32"
              stroke="#FAF9F6"
              strokeWidth="1"
              strokeLinecap="round"
              transform="rotate(65 80 80)"
            />

            {/* Micro-movimiento Horológico: Segundero con barrido suave */}
            <g className="animate-intro-hand">
              {/* Vástago del segundero */}
              <line
                x1="80"
                y1="90"
                x2="80"
                y2="22"
                stroke="#A58A68"
                strokeWidth="0.75"
                strokeLinecap="round"
              />
              {/* Contrapeso circular clásico de alta relojería */}
              <circle
                cx="80"
                cy="87"
                r="1.75"
                stroke="#A58A68"
                strokeWidth="0.6"
                fill="#171717"
              />
            </g>

            {/* Piñón central (Canon Pinion / Joya central) */}
            <circle
              cx="80"
              cy="80"
              r="3.5"
              fill="#171717"
              stroke="#A58A68"
              strokeWidth="1"
            />
            <circle
              cx="80"
              cy="80"
              r="1.25"
              fill="#A58A68"
            />
          </svg>
        </div>

        {/* Tipografía de Marca: CRONOS GENÈVE */}
        <div className="flex flex-col items-center mt-6 sm:mt-7 text-center">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.28em] text-[#FAF9F6] uppercase leading-none animate-intro-text pl-[0.28em]">
            Cronos
          </h1>

          {/* Micro-línea divisoria champagne */}
          <div className="w-10 sm:w-12 h-[1px] bg-[#A58A68]/60 my-2.5 sm:my-3 animate-intro-line" />

          {/* Sello de origen suizo */}
          <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.45em] text-[#A58A68] uppercase font-medium leading-none animate-intro-subtext pl-[0.45em]">
            Genève
          </span>

          {/* Detalle editorial Haute Horlogerie */}
          <span className="font-sans text-[8px] sm:text-[9px] tracking-[0.35em] text-[#8F8B83] uppercase mt-2.5 leading-none animate-intro-tagline pl-[0.35em]">
            Haute Horlogerie
          </span>
        </div>
      </div>

      {/* Discreta indicación de skip */}
      <div className="absolute bottom-6 sm:bottom-8 text-center pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-[9px] sm:text-[10px] tracking-[0.22em] text-[#6F6B64] hover:text-[#A58A68] uppercase transition-colors duration-200"
          aria-label="Saltar introducción de marca"
        >
          Saltar intro · Esc
        </button>
      </div>
    </div>
  );
}

export default BrandIntro;
