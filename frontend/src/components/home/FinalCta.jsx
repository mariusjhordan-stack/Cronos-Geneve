import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FinalCta() {
  return (
    <section className="py-28 sm:py-36 border-b border-cronos-line bg-cronos-surface/30 text-center">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="font-mono text-technical tracking-widest-brand text-cronos-bronze uppercase block mb-3">
          CATÁLOGO HOROLÓGICO &bull; CRONOS GENÈVE
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-cronos-text tracking-[0.04em] leading-tight mb-6">
          ENCUENTRE SU PRÓXIMA PIEZA
        </h2>

        <p className="mx-auto max-w-xl text-xs sm:text-sm text-cronos-muted font-sans leading-relaxed mb-10">
          Explore nuestra selección de piezas de manufactura, consulte especificaciones técnicas de calibre y compare modelos en nuestra matriz interactiva.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <a href="#catalogo">
            <Button variant="default" size="lg" className="flex items-center gap-2">
              <span>EXPLORAR COLECCIÓN</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>

          <Link to="/comparador">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-cronos-bronze" />
              <span>CONSULTAR MATRIZ COMPARATIVA</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
