import React from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';

export function ProductGrid({ relojes = [], onResetFilters }) {
  if (relojes.length === 0) {
    return (
      <div className="border border-cronos-line py-24 px-6 text-center my-8 bg-white shadow-editorial">
        <span className="font-mono text-[10px] tracking-[0.24em] text-cronos-bronze uppercase block mb-2">
          CONSULTA DE CATÁLOGO
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-cronos-text mb-3">
          Ninguna pieza coincide con los criterios
        </h3>
        <p className="mx-auto max-w-md text-xs text-cronos-muted leading-relaxed font-sans mb-6">
          Pruebe con otra manufactura, complicación o referencia, o restablezca los filtros para explorar la colección completa.
        </p>
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          RESTAURAR FILTROS &rarr;
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t border-l border-cronos-line bg-white shadow-editorial">
      {/* 
        Vitrina Editorial Suiza:
        Mobile: 1 columna
        Tablet: 2 columnas
        Desktop: 3 columnas
        Filetes milimétricos continuos de 1px sin solapamientos
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {relojes.map((reloj) => (
          <div
            key={reloj.id}
            className="border-r border-b border-cronos-line"
          >
            <ProductCard reloj={reloj} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
