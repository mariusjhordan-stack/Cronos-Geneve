import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import heroImg from '@/assets/hero.png';

export function HeritageEssay() {
  return (
    <section id="herencia" className="border-b border-cronos-line bg-cronos-bg py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-cronos-surface-1">
              <img
                src={heroImg}
                alt="Alta Relojería Mecánica Suiza"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
            <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-cronos-muted">
              <span>Haute Horlogerie</span>
              <span className="text-cronos-bronze">Calibre mecánico</span>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <span className="block font-mono text-technical uppercase tracking-widest-brand text-cronos-bronze">
              Herencia y precisión
            </span>

            <h2 className="font-serif text-3xl leading-tight tracking-[0.04em] text-cronos-text sm:text-4xl lg:text-5xl">
              La disciplina del
              <span className="mt-1 block italic font-light text-cronos-text/90">tiempo mecánico</span>
            </h2>

            <p className="max-w-xl font-sans text-base leading-relaxed text-cronos-muted">
              Un guardatiempo de manufactura no es un simple accesorio; es un testimonio de física aplicada y paciencia artesanal. En una época dominada por lo fugaz y digital, la relojería mecánica preserva la devoción por el engranaje tallado a mano, la espiral paramagnética y la regulación micrométrica de la frecuencia.
            </p>

            <blockquote className="border-l border-cronos-bronze py-1 pl-5 font-serif text-lg italic text-cronos-text/90 sm:text-xl">
              “El tiempo no se fabrica dos veces.”
            </blockquote>

            <p className="max-w-xl font-sans text-sm leading-relaxed text-cronos-muted">
              En Cronos Genève documentamos cada pieza con sus especificaciones de manufactura, características de caja, calibre y materiales, preservando el rigor técnico de la relojería tradicional.
            </p>

            <div className="grid max-w-xl grid-cols-1 gap-8 pt-6 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 shrink-0 stroke-[1.4] text-cronos-bronze" />
                  <span className="font-mono text-technical uppercase tracking-widest text-cronos-text">
                    Calibre y movimiento
                  </span>
                </div>
                <p className="font-sans text-sm leading-relaxed text-cronos-muted">
                  Mecanismos automáticos, manuales y de precisión seleccionados por su arquitectura horológica.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 stroke-[1.4] text-cronos-bronze" />
                  <span className="font-mono text-technical uppercase tracking-widest text-cronos-text">
                    Ficha de manufactura
                  </span>
                </div>
                <p className="font-sans text-sm leading-relaxed text-cronos-muted">
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
