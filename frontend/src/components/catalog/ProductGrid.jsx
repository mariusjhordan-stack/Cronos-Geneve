import React from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';

export function ProductGrid({ relojes = [], onResetFilters }) {
  if (relojes.length === 0) {
    return (
      <div className="border-y border-cronos-line py-20 text-center my-8 bg-cronos-surface/40">
        <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase block mb-2">
          INVENTARIO VACÍO
        </span>
        <h3 className="font-serif text-2xl text-white mb-3">
          Sin piezas registradas bajo este criterio
        </h3>
        <p className="mx-auto max-w-md text-xs text-cronos-muted leading-relaxed font-sans mb-6">
          No se encontraron guardatiempos que coincidan con la búsqueda o filtros aplicados en la bóveda. Restablezca los criterios para explorar la colección completa.
        </p>
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          RESTABLECER CATÁLOGO &rarr;
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t border-b border-cronos-line">
      {/* 
        Responsive Gallery Grid:
        Mobile: 1 column
        Tablet: 2 columns
        Desktop: 3 columns
        Separated by 1px borders
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-cronos-line">
        {relojes.map((reloj, index) => (
          <div
            key={reloj.id}
            className={`
              ${index >= 1 ? 'border-t md:border-t-0' : ''}
              ${index >= 2 ? 'md:border-t lg:border-t-0' : ''}
              ${index >= 3 ? 'lg:border-t' : ''}
              border-cronos-line
            `}
          >
            <ProductCard reloj={reloj} />
          </div>
        ))}
      </div>
    </div>
  );
}
