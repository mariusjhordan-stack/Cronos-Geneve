import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import heroImg from '@/assets/hero.png';

export function HeritageEssay() {
  return (
    <section id="herencia" className="py-24 sm:py-32 border-b border-cronos-line bg-cronos-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Columna Izquierda: Escaparate Visual Arquitectónico (5 cols) */}
          <div className="lg:col-span-5">
            <div className="border border-cronos-line bg-cronos-surface p-6 sm:p-10 relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-cronos-line/60 bg-cronos-bg flex items-center justify-center p-6">
                <img
                  src={heroImg}
                  alt="Alta Relojería Mecánica Suiza"
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                  loading="lazy"
                />
              </div>

              {/* Detalle al pie del marco */}
              <div className="mt-4 pt-4 border-t border-cronos-line/60 flex items-center justify-between text-technical font-mono text-cronos-muted">
                <span>HAUTE HORLOGERIE</span>
                <span className="text-cronos-bronze">CALIBRE MECÁNICO</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Ensayo Editorial (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <span className="font-mono text-technical tracking-widest-brand text-cronos-bronze uppercase block">
              HERENCIA &amp; PRECISIÓN
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-cronos-text tracking-[0.04em] leading-tight">
              LA DISCIPLINA DEL <br />
              <span className="italic font-light text-cronos-text/90">TIEMPO MECÁNICO</span>
            </h2>

            <p className="font-sans text-sm sm:text-base text-cronos-muted leading-relaxed max-w-xl">
              Un guardatiempo de manufactura no es un simple accesorio; es un testimonio de física aplicada y paciencia artesanal. En una época dominada por lo fugaz y digital, la relojería mecánica preserva la devoción por el engranaje tallado a mano, la espiral paramagnética y la regulación micrométrica de la frecuencia.
            </p>

            <blockquote className="border-l-2 border-cronos-bronze pl-4 py-1 italic font-serif text-base sm:text-lg text-cronos-text/90">
              &ldquo;El tiempo no se fabrica dos veces.&rdquo;
            </blockquote>

            <p className="font-sans text-xs sm:text-sm text-cronos-muted leading-relaxed max-w-xl">
              En Cronos Genève documentamos cada pieza con sus especificaciones de manufactura, características de caja, calibre y materiales, preservando el rigor técnico de la relojería tradicional.
            </p>

            {/* Micro-bloques técnicos */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="border border-cronos-line bg-cronos-surface p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Award className="h-4 w-4 text-cronos-bronze shrink-0 stroke-[1.4]" />
                  <span className="font-mono text-technical tracking-widest text-cronos-text uppercase">
                    CALIBRE &amp; MOVIMIENTO
                  </span>
                </div>
                <p className="text-[11px] text-cronos-muted font-sans leading-relaxed">
                  Mecanismos automáticos, manuales y de precisión seleccionados por su arquitectura horológica.
                </p>
              </div>

              <div className="border border-cronos-line bg-cronos-surface p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="h-4 w-4 text-cronos-bronze shrink-0 stroke-[1.4]" />
                  <span className="font-mono text-technical tracking-widest text-cronos-text uppercase">
                    FICHA DE MANUFACTURA
                  </span>
                </div>
                <p className="text-[11px] text-cronos-muted font-sans leading-relaxed">
                  Información detallada sobre hermeticidad, dimensiones de caja y materiales en cada pieza.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
