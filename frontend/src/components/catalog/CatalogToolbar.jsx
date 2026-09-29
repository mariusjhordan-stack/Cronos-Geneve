import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CatalogToolbar({
  marcas = [],
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
}) {
  const hasActiveFilters =
    Boolean(filters.buscar) ||
    Boolean(filters.marca) ||
    Boolean(filters.movimiento) ||
    (filters.orden && filters.orden !== 'novedades');

  return (
    <div className="border border-cronos-line bg-cronos-surface/90 backdrop-blur-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-cronos-line">
        {/* 1. BUSCAR (3 cols) */}
        <div className="lg:col-span-3 p-3.5 flex flex-col justify-center">
          <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
            BUSCAR
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.buscar || ''}
              onChange={(e) => onFilterChange('buscar', e.target.value)}
              placeholder="Referencia o calibre..."
              className="h-9 w-full bg-transparent text-xs text-white placeholder:text-cronos-muted/40 focus:outline-none font-sans pl-6"
            />
            <Search className="absolute left-0 top-2.5 h-3.5 w-3.5 text-cronos-muted pointer-events-none stroke-[1.5]" />
          </div>
        </div>

        {/* 2. MANUFACTURA (3 cols) */}
        <div className="lg:col-span-3 p-3.5 flex flex-col justify-center">
          <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
            MANUFACTURA
          </label>
          <select
            value={filters.marca || ''}
            onChange={(e) => onFilterChange('marca', e.target.value)}
            className="h-9 w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer font-sans"
          >
            <option value="" className="bg-cronos-surface text-cronos-text">
              Todas las Casas
            </option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id} className="bg-cronos-surface text-cronos-text">
                {m.nombre} {m.total_modelos ? `(${m.total_modelos})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 3. CALIBRE (3 cols) */}
        <div className="lg:col-span-3 p-3.5 flex flex-col justify-center">
          <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
            CALIBRE
          </label>
          <select
            value={filters.movimiento || ''}
            onChange={(e) => onFilterChange('movimiento', e.target.value)}
            className="h-9 w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer font-sans"
          >
            <option value="" className="bg-cronos-surface text-cronos-text">
              Cualquier Calibre
            </option>
            <option value="AUTOMATICO" className="bg-cronos-surface text-cronos-text">
              Automático
            </option>
            <option value="CUARZO" className="bg-cronos-surface text-cronos-text">
              Cuarzo
            </option>
            <option value="SOLAR" className="bg-cronos-surface text-cronos-text">
              Solar
            </option>
            <option value="MANUAL" className="bg-cronos-surface text-cronos-text">
              Cuerda Manual
            </option>
          </select>
        </div>

        {/* 4. ORDENAR & RESET (3 cols) */}
        <div className="lg:col-span-3 p-3.5 flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              ORDENAR
            </label>
            <select
              value={filters.orden || 'novedades'}
              onChange={(e) => onFilterChange('orden', e.target.value)}
              className="h-9 w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer font-sans"
            >
              <option value="novedades" className="bg-cronos-surface text-cronos-text">
                Novedades de Bóveda
              </option>
              <option value="precio_asc" className="bg-cronos-surface text-cronos-text">
                Precio: Menor a Mayor
              </option>
              <option value="precio_desc" className="bg-cronos-surface text-cronos-text">
                Precio: Mayor a Menor
              </option>
              <option value="nombre_asc" className="bg-cronos-surface text-cronos-text">
                Referencia (A - Z)
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="self-end mb-1 text-[10px] font-mono tracking-widest text-cronos-bronze hover:text-white uppercase transition-colors shrink-0 flex items-center gap-1"
              title="Restablecer filtros"
            >
              <RotateCcw className="h-3 w-3" />
              <span>LIMPIAR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
