import React from 'react';
import { AnimatePresence } from 'motion/react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';

export function ProductGrid({ relojes = [], onResetFilters }) {
  if (relojes.length === 0) {
    return (
      <div className="my-8 px-6 py-24 text-center">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.24em] text-cronos-bronze">
          Consulta de catálogo
        </span>
        <h3 className="mb-3 font-serif text-2xl text-cronos-text sm:text-3xl">
          Ninguna pieza coincide con los criterios
        </h3>
        <p className="mx-auto mb-6 max-w-md font-sans text-sm leading-relaxed text-cronos-muted">
          Pruebe con otra manufactura, complicación o referencia, o restablezca los filtros para
          explorar la colección completa.
        </p>
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Restaurar filtros
        </Button>
      </div>
    );
  }

  const layoutForIndex = (index) => {
    if (relojes.length === 1) return 'single';
    if (relojes.length === 2) return 'pair';
    return ['lead', 'middle', 'narrow'][index % 3];
  };

  return (
    <div className="grid grid-cols-1 items-start gap-x-8 gap-y-8 md:grid-cols-2 md:gap-x-10 md:gap-y-12 xl:grid-cols-12 xl:gap-x-8 xl:gap-y-16">
      <AnimatePresence mode="popLayout">
        {relojes.map((reloj, index) => (
          <ProductCard key={reloj.id} reloj={reloj} layoutVariant={layoutForIndex(index)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ProductGrid;
