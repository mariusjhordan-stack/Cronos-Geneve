import React from 'react';

export function BrandStrip({ marcas = [], onSelectMarca }) {
  if (!marcas || marcas.length === 0) return null;

  return (
    <section className="border-y border-cronos-line bg-cronos-surface/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cronos-line/60 pb-3 mb-6">
          <span className="font-mono text-technical text-cronos-muted uppercase tracking-widest-brand">
            MANUFACTURAS REGISTRADAS EN BÓVEDA
          </span>
          <span className="font-mono text-technical text-cronos-bronze tracking-wider">
            {marcas.length} CASAS HOROLÓGICAS
          </span>
        </div>

        {/* Índice editorial con scroll horizontal en mobile y wrap en desktop */}
        <div className="flex items-center gap-8 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible">
          {marcas.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMarca(m.id)}
              className="group shrink-0 inline-flex items-center gap-2 text-xs font-sans tracking-[0.24em] text-cronos-muted hover:text-cronos-text transition-colors uppercase cursor-pointer"
            >
              <span className="group-hover:text-cronos-bronze transition-colors">
                {m.nombre}
              </span>
              {m.total_modelos > 0 && (
                <span className="font-mono text-[9px] text-cronos-tertiary group-hover:text-cronos-bronze/80">
                  [{String(m.total_modelos).padStart(2, '0')}]
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
