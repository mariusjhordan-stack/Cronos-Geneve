import React, { useState, useEffect, useRef, useId } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export function EditorialPieceSelector({
  slotIndex,
  currentPiece,
  allWatches = [],
  onSelectPiece,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const triggerId = useId();
  const listboxId = useId();

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Enfocar el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredWatches = allWatches.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const brand = (w.marca_nombre || w.marca_detalle?.nombre || '').toLowerCase();
    const name = (w.nombre || '').toLowerCase();
    return brand.includes(q) || name.includes(q);
  });

  const handleSelect = (relojId) => {
    onSelectPiece(slotIndex, relojId);
    setIsOpen(false);
  };

  const brandDisplayName = currentPiece
    ? currentPiece.marca_nombre || currentPiece.marca_detalle?.nombre || 'Manufactura Suiza'
    : '';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Botón Disparador del Selector */}
      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={`Seleccionar guardatiempo para posición 0${slotIndex + 1}`}
        className="flex h-11 w-full items-center justify-between border border-cronos-line bg-white px-3.5 py-2 text-xs font-sans tracking-wide text-cronos-text hover:border-cronos-text/50 focus:border-cronos-text focus:outline-none transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:bg-cronos-surface-2 disabled:text-cronos-muted text-left"
      >
        <span className="truncate pr-2">
          {currentPiece ? (
            <span className="inline-flex items-center gap-1.5 truncate">
              <strong className="font-semibold text-cronos-text uppercase font-mono text-[10px] tracking-wider">
                {brandDisplayName}
              </strong>
              <span className="text-cronos-muted">&mdash;</span>
              <span className="truncate text-cronos-text">{currentPiece.nombre}</span>
            </span>
          ) : (
            <span className="text-cronos-muted font-normal">
              Seleccionar guardatiempo
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-cronos-muted shrink-0 transition-transform duration-200 stroke-[1.5] ${
            isOpen ? 'rotate-180 text-cronos-text' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable Editorial */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="absolute z-50 left-0 right-0 mt-1 border border-cronos-line bg-white shadow-modal animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {/* Búsqueda rápida */}
          <div className="p-2 border-b border-cronos-line bg-cronos-surface-1 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-cronos-muted shrink-0 stroke-[1.4]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por marca o modelo..."
              className="w-full bg-transparent text-xs text-cronos-text placeholder:text-cronos-muted focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-cronos-muted hover:text-cronos-text p-0.5 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Lista desplazable de opciones (SOLO MARCA Y MODELO, SIN PRECIO) */}
          <div className="max-h-64 overflow-y-auto divide-y divide-cronos-line/40 py-1">
            {/* Opción para limpiar ranura */}
            {currentPiece && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => handleSelect('')}
                className="w-full px-3.5 py-2.5 text-left text-xs font-mono text-cronos-muted hover:bg-cronos-surface-1 hover:text-cronos-text transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>&times; Despejar ranura de comparación</span>
              </button>
            )}

            {filteredWatches.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-cronos-muted font-mono uppercase tracking-wider">
                No se encontraron piezas
              </div>
            ) : (
              filteredWatches.map((watch) => {
                const brand = watch.marca_nombre || watch.marca_detalle?.nombre || 'Manufactura Suiza';
                const isSelected = currentPiece?.id === watch.id;

                return (
                  <button
                    key={watch.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(watch.id)}
                    className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-cronos-surface-1 border-l-2 border-cronos-bronze pl-3'
                        : 'hover:bg-cronos-surface-1'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] tracking-widest text-cronos-bronze uppercase">
                        {brand}
                      </span>
                      <span className="block font-serif text-xs sm:text-sm text-cronos-text font-normal truncate">
                        {watch.nombre}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-cronos-bronze shrink-0 stroke-[2]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
