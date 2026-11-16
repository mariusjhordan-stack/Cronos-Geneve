import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scale } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/Button';

export function FinalCta() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-cronos-line bg-cronos-bg py-28 text-center sm:py-36">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-cronos-bronze/70" />
            <span className="font-mono text-technical uppercase tracking-widest-brand text-cronos-bronze">
              Catálogo Horológico · Cronos Genève
            </span>
            <span className="h-px w-6 bg-cronos-bronze/70" />
          </div>

          <h2 className="mb-6 font-serif text-3xl leading-tight tracking-[0.02em] text-cronos-text sm:text-5xl lg:text-6xl">
            Encuentre su próxima pieza de manufactura
          </h2>

          <p className="mx-auto mb-10 max-w-xl font-sans text-sm leading-relaxed text-cronos-muted sm:text-base">
            Explore nuestra selección de piezas de manufactura, consulte especificaciones técnicas
            de calibre y compare modelos en nuestra matriz interactiva.
          </p>

          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <a href="#catalogo">
              <Button variant="default" size="lg" className="group flex items-center gap-2">
                <span>Explorar colección</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </a>

            <Link to="/comparador">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-cronos-bronze" />
                <span>Consultar matriz comparativa</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCta;
