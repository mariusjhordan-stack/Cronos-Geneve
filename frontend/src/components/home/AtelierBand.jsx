import React from 'react';
import { BadgeCheck, PackageCheck, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const PILLARS = [
  {
    icon: BadgeCheck,
    title: 'Autenticidad certificada',
    text: 'Cada pieza se entrega con su certificado de origen y el número de serie verificado por la casa.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantía internacional',
    text: 'Cobertura del fabricante y revisión técnica previa a la entrega, sin letra pequeña.',
  },
  {
    icon: PackageCheck,
    title: 'Envío asegurado',
    text: 'Transporte con seguro total y entrega con firma, en estuche original sellado.',
  },
];

/** Sección oscura a mitad del home: rompe el ritmo claro y refuerza la confianza antes del catálogo. */
export function AtelierBand() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-[#171717] py-section text-white lg:py-section-lg" aria-labelledby="atelier-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="mb-4 block font-mono text-[11px] uppercase tracking-[0.36em] text-cronos-bronze-light">
            El compromiso de la casa
          </span>
          <h2 id="atelier-title" className="font-serif text-3xl tracking-[0.02em] sm:text-4xl lg:text-5xl">
            Una pieza que dura generaciones merece una compra sin dudas
          </h2>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {PILLARS.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-white/15 pt-8"
            >
              <Icon className="mb-5 h-6 w-6 stroke-[1.2] text-cronos-bronze-light" aria-hidden="true" />
              <h3 className="mb-3 font-serif text-xl tracking-[0.02em]">{title}</h3>
              <p className="font-sans text-sm leading-relaxed text-white/70">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AtelierBand;
