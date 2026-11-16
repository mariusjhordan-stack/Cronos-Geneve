import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function BrandStrip({ marcas = [], onSelectMarca }) {
  const shouldReduceMotion = useReducedMotion();
  if (!marcas || marcas.length === 0) return null;

  return (
    <section className="border-y border-cronos-line bg-cronos-bg py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex flex-col justify-between gap-4 border-b border-cronos-line/60 pb-3 sm:flex-row sm:items-center"
        >
          <span className="font-mono text-technical uppercase tracking-widest-brand text-cronos-muted">
            Manufacturas registradas en bóveda
          </span>
          <span className="font-mono text-technical tracking-wider text-cronos-bronze">
            {marcas.length} Casas Horológicas
          </span>
        </motion.div>

        {/* Índice editorial con scroll horizontal en mobile y wrap en desktop */}
        <div className="flex items-center gap-8 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible">
          {marcas.map((m, idx) => (
            <motion.button
              key={m.id}
              type="button"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : idx * 0.04 }}
              onClick={() => onSelectMarca(m.id)}
              className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-xs font-sans uppercase tracking-[0.24em] text-cronos-muted transition-colors hover:text-cronos-text"
            >
              <span className="transition-colors duration-200 group-hover:text-cronos-bronze">
                {m.nombre}
              </span>
              {m.total_modelos > 0 && (
                <span className="font-mono text-[9px] text-cronos-tertiary transition-colors group-hover:text-cronos-bronze/80">
                  [{String(m.total_modelos).padStart(2, '0')}]
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandStrip;
