import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
  SheetFooter,
} from '@/components/ui/Sheet';

export function CatalogToolbar({
  marcas = [],
  categorias = [],
  filters,
  onFilterChange,
  onResetFilters,
}) {
  const [searchTerm, setSearchTerm] = useState(filters.buscar || '');
  const [prevBuscar, setPrevBuscar] = useState(filters.buscar || '');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sincronizar el input si el filtro cambia externamente (ej. reset o URL directa)
  if ((filters.buscar || '') !== prevBuscar) {
    setPrevBuscar(filters.buscar || '');
    setSearchTerm(filters.buscar || '');
  }

  // Debounce para búsqueda (300ms) evitando peticiones excesivas
  useEffect(() => {
    if (searchTerm === (filters.buscar || '')) return;

    const timer = setTimeout(() => {
      onFilterChange('buscar', searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.buscar, onFilterChange]);

  const handleClearSearch = () => {
    setSearchTerm('');
    onFilterChange('buscar', '');
  };

  const hasActiveFilters =
    Boolean(filters.buscar) ||
    Boolean(filters.marca) ||
    Boolean(filters.categoria) ||
    Boolean(filters.movimiento) ||
    (filters.orden && filters.orden !== 'novedades');

  const activeCount = [
    Boolean(filters.buscar),
    Boolean(filters.marca),
    Boolean(filters.categoria),
    Boolean(filters.movimiento),
    Boolean(filters.orden && filters.orden !== 'novedades'),
  ].filter(Boolean).length;

  return (
    <div className="mb-8">
      {/* ==========================================
          1. BARRA EDITORIAL HORIZONTAL (DESKTOP >= 1024px)
          ========================================== */}
      <div className="hidden lg:block border border-cronos-line bg-white shadow-editorial">
        <div className="grid grid-cols-12 divide-x divide-cronos-line">
          {/* 1.1 BÚSQUEDA (3 columnas) */}
          <div className="col-span-3 p-3 flex flex-col justify-center">
            <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              BUSCAR
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Referencia o calibre..."
                className="h-9 w-full bg-transparent text-xs text-cronos-text placeholder:text-cronos-muted/50 focus:outline-none font-sans pl-6 pr-6"
              />
              <Search className="absolute left-0 top-2.5 h-3.5 w-3.5 text-cronos-muted pointer-events-none stroke-[1.5]" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-0 top-2 text-cronos-muted hover:text-cronos-text p-0.5 cursor-pointer"
                  title="Borrar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 1.2 MANUFACTURA (2 columnas) */}
          <div className="col-span-2 p-3 flex flex-col justify-center">
            <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              MANUFACTURA
            </label>
            <Select
              value={filters.marca || ''}
              onChange={(e) => onFilterChange('marca', e.target.value)}
              className="h-9 border-0 bg-transparent px-0 text-xs focus:ring-0 text-cronos-text"
              aria-label="Filtrar por manufactura"
            >
              <option value="" className="bg-white text-cronos-text">
                Todas las Casas
              </option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-cronos-text">
                  {m.nombre} {m.total_modelos ? `(${m.total_modelos})` : ''}
                </option>
              ))}
            </Select>
          </div>

          {/* 1.3 CATEGORÍA / COMPLICACIÓN (2 columnas) */}
          <div className="col-span-2 p-3 flex flex-col justify-center">
            <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              CATEGORÍA
            </label>
            <Select
              value={filters.categoria || ''}
              onChange={(e) => onFilterChange('categoria', e.target.value)}
              className="h-9 border-0 bg-transparent px-0 text-xs focus:ring-0 text-cronos-text"
              aria-label="Filtrar por categoría horológica"
            >
              <option value="" className="bg-white text-cronos-text">
                Todas las Familias
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-cronos-text">
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>

          {/* 1.4 CALIBRE / MECANISMO (2 columnas) */}
          <div className="col-span-2 p-3 flex flex-col justify-center">
            <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
              CALIBRE
            </label>
            <Select
              value={filters.movimiento || ''}
              onChange={(e) => onFilterChange('movimiento', e.target.value)}
              className="h-9 border-0 bg-transparent px-0 text-xs focus:ring-0 text-cronos-text"
              aria-label="Filtrar por calibre o movimiento"
            >
              <option value="" className="bg-white text-cronos-text">
                Cualquier Calibre
              </option>
              <option value="AUTOMATICO" className="bg-white text-cronos-text">
                Automático
              </option>
              <option value="MANUAL" className="bg-white text-cronos-text">
                Cuerda Manual
              </option>
              <option value="CUARZO" className="bg-white text-cronos-text">
                Cuarzo
              </option>
              <option value="SOLAR" className="bg-white text-cronos-text">
                Solar
              </option>
            </Select>
          </div>

          {/* 1.5 ORDENAMIENTO & RESET (3 columnas) */}
          <div className="col-span-3 p-3 flex items-center justify-between gap-2">
            <div className="flex-1">
              <label className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
                ORDENAR
              </label>
              <Select
                value={filters.orden || 'novedades'}
                onChange={(e) => onFilterChange('orden', e.target.value)}
                className="h-9 border-0 bg-transparent px-0 text-xs focus:ring-0 text-cronos-text"
                aria-label="Criterio de ordenamiento"
              >
                <option value="novedades" className="bg-white text-cronos-text">
                  Novedades de Bóveda
                </option>
                <option value="precio_asc" className="bg-white text-cronos-text">
                  Precio: Menor a Mayor
                </option>
                <option value="precio_desc" className="bg-white text-cronos-text">
                  Precio: Mayor a Menor
                </option>
                <option value="nombre_asc" className="bg-white text-cronos-text">
                  Referencia (A - Z)
                </option>
              </Select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="self-end mb-1 text-[10px] font-mono tracking-widest text-cronos-bronze hover:text-cronos-text uppercase transition-colors shrink-0 flex items-center gap-1 cursor-pointer pl-2"
                title="Restablecer todos los criterios"
              >
                <RotateCcw className="h-3 w-3" />
                <span>LIMPIAR</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          2. BARRA COMPACTA CON SHEET (TABLET & MOBILE < 1024px)
          ========================================== */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Referencia o calibre..."
            className="h-11 w-full border border-cronos-line bg-white pl-9 pr-8 text-xs font-sans text-cronos-text placeholder:text-cronos-muted/50 focus:border-cronos-text focus:outline-none"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-cronos-muted pointer-events-none stroke-[1.5]" />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-3 text-cronos-muted hover:text-cronos-text p-0.5 cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="h-11 flex items-center gap-2 border border-cronos-line bg-white px-4 font-mono text-xs tracking-wider text-cronos-text hover:border-cronos-text transition-colors cursor-pointer shrink-0"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-cronos-bronze stroke-[1.5]" />
          <span className="hidden sm:inline">FILTROS</span>
          {activeCount > 0 && (
            <span className="bg-[#171717] text-white font-mono text-[10px] px-1.5 py-0.5 font-medium">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* PANEL LATERAL DE FILTROS EN TABLET/MOBILE */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetHeader onClose={() => setSheetOpen(false)}>
          <SheetTitle>FILTROS & ORDEN</SheetTitle>
          <SheetDescription>CRONOS GENÈVE &bull; CATÁLOGO EDITORIAL</SheetDescription>
        </SheetHeader>
        <SheetContent className="space-y-6 py-6">
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-cronos-bronze uppercase mb-2">
              MANUFACTURA
            </label>
            <Select
              value={filters.marca || ''}
              onChange={(e) => onFilterChange('marca', e.target.value)}
              aria-label="Filtrar por manufactura"
            >
              <option value="" className="bg-white text-cronos-text">
                Todas las Casas
              </option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-cronos-text">
                  {m.nombre} {m.total_modelos ? `(${m.total_modelos})` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest text-cronos-bronze uppercase mb-2">
              CATEGORÍA / COMPLICACIÓN
            </label>
            <Select
              value={filters.categoria || ''}
              onChange={(e) => onFilterChange('categoria', e.target.value)}
              aria-label="Filtrar por categoría horológica"
            >
              <option value="" className="bg-white text-cronos-text">
                Todas las Familias
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-cronos-text">
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest text-cronos-bronze uppercase mb-2">
              CALIBRE / MECANISMO
            </label>
            <Select
              value={filters.movimiento || ''}
              onChange={(e) => onFilterChange('movimiento', e.target.value)}
              aria-label="Filtrar por calibre o movimiento"
            >
              <option value="" className="bg-white text-cronos-text">
                Cualquier Calibre
              </option>
              <option value="AUTOMATICO" className="bg-white text-cronos-text">
                Automático
              </option>
              <option value="MANUAL" className="bg-white text-cronos-text">
                Cuerda Manual
              </option>
              <option value="CUARZO" className="bg-white text-cronos-text">
                Cuarzo
              </option>
              <option value="SOLAR" className="bg-white text-cronos-text">
                Solar
              </option>
            </Select>
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest text-cronos-bronze uppercase mb-2">
              ORDENAMIENTO
            </label>
            <Select
              value={filters.orden || 'novedades'}
              onChange={(e) => onFilterChange('orden', e.target.value)}
              aria-label="Criterio de ordenamiento"
            >
              <option value="novedades" className="bg-white text-cronos-text">
                Novedades de Bóveda
              </option>
              <option value="precio_asc" className="bg-white text-cronos-text">
                Precio: Menor a Mayor
              </option>
              <option value="precio_desc" className="bg-white text-cronos-text">
                Precio: Mayor a Menor
              </option>
              <option value="nombre_asc" className="bg-white text-cronos-text">
                Referencia (A - Z)
              </option>
            </Select>
          </div>
        </SheetContent>
        <SheetFooter className="flex flex-col gap-2.5">
          <Button
            variant="default"
            className="w-full justify-center"
            onClick={() => setSheetOpen(false)}
          >
            APLICAR CRITERIOS
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => {
                onResetFilters();
                setSheetOpen(false);
              }}
            >
              RESTAURAR FILTROS
            </Button>
          )}
        </SheetFooter>
      </Sheet>
    </div>
  );
}

export default CatalogToolbar;
