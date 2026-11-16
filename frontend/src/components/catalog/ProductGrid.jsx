import React from 'react';
import { AnimatePresence } from 'motion/react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';

export function ProductGrid({ relojes = [], onResetFilters }) {
  if (relojes.length === 0) {
    return (
      <div className="my-8 px-6 py-24 text-center">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.24em] text-cronos-bronze">
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

  // Jerarquía: la primera pieza disponible se presenta grande (2 columnas); el resto, en tarjetas normales.
  const featuredId = relojes.length >= 4 ? relojes.find((r) => r.stock > 0)?.id : undefined;
  const ordered = featuredId ? [relojes.find((r) => r.id === featuredId), ...relojes.filter((r) => r.id !== featuredId)] : relojes;

  return (
    <div className="grid grid-cols-1 items-start gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {ordered.map((reloj) => (
          <ProductCard key={reloj.id} reloj={reloj} featured={reloj.id === featuredId} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ProductGrid;
