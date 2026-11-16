import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Desplegable editorial con buscador (misma estética que el selector del comparador).
 * Mantiene la API del <select> nativo: se usa con <option> como hijos y `onChange(e)` recibe
 * `e.target.value`, así los formularios existentes no cambian.
 * El buscador aparece cuando hay 5 opciones o más (o con `searchable`).
 */
export const Select = React.forwardRef(
  ({ className, children, value = '', onChange, name, disabled, searchable, placeholder, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const rootRef = useRef(null);
    const searchRef = useRef(null);
    const listId = useId();

    const options = useMemo(
      () =>
        React.Children.toArray(children)
          .filter((child) => React.isValidElement(child) && child.type === 'option')
          .map((child) => ({
            value: String(child.props.value ?? ''),
            label: React.Children.toArray(child.props.children).join('').replace(/\s+/g, ' ').trim(),
            disabled: Boolean(child.props.disabled),
          })),
      [children],
    );

    const showSearch = searchable ?? options.length >= 5;
    const current = options.find((o) => o.value === String(value));
    const visible = options.filter((o) => !query.trim() || o.label.toLowerCase().includes(query.trim().toLowerCase()));

    useEffect(() => {
      if (!open) return undefined;
      const onDown = (e) => {
        if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('mousedown', onDown);
      document.addEventListener('touchstart', onDown);
      return () => {
        document.removeEventListener('mousedown', onDown);
        document.removeEventListener('touchstart', onDown);
      };
    }, [open]);

    useEffect(() => {
      if (open && showSearch) searchRef.current?.focus();
    }, [open, showSearch]);

    const close = () => {
      setOpen(false);
      setQuery('');
    };

    const toggle = () => {
      if (disabled) return;
      if (open) {
        close();
      } else {
        setActive(Math.max(0, options.findIndex((o) => o.value === String(value))));
        setOpen(true);
      }
    };

    const choose = (option) => {
      if (!option || option.disabled) return;
      onChange?.({ target: { value: option.value, name }, currentTarget: { value: option.value, name } });
      close();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) return setOpen(true);
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setActive((i) => Math.min(Math.max(i + step, 0), Math.max(visible.length - 1, 0)));
      } else if (e.key === 'Enter' && open) {
        e.preventDefault();
        choose(visible[Math.min(active, visible.length - 1)]);
      }
    };

    return (
      <div ref={rootRef} className="relative inline-block w-full" onKeyDown={onKeyDown}>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            'flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-none border border-cronos-line bg-white px-3.5 py-2 text-left font-sans text-xs tracking-wide text-cronos-text transition-colors duration-200 hover:border-cronos-text/50 focus:border-cronos-text focus:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text disabled:cursor-not-allowed disabled:bg-cronos-surface-2 disabled:text-cronos-muted disabled:opacity-60',
            className,
          )}
          {...props}
        >
          <span className={cn('truncate', !current && 'text-cronos-muted')}>{current?.label || placeholder || 'Seleccionar'}</span>
          <ChevronDown
            className={cn('h-3.5 w-3.5 shrink-0 stroke-[1.5] text-cronos-muted transition-transform duration-200', open && 'rotate-180 text-cronos-text')}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 z-50 mt-1 min-w-[12rem] border border-cronos-line bg-white shadow-modal animate-in fade-in-0 zoom-in-95 duration-200">
            {showSearch && (
              <div className="flex items-center gap-2 border-b border-cronos-line bg-cronos-surface-1 p-2">
                <Search className="h-3.5 w-3.5 shrink-0 stroke-[1.4] text-cronos-muted" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder="Buscar..."
                  aria-label="Buscar en la lista"
                  className="w-full bg-transparent font-sans text-xs text-cronos-text placeholder:text-cronos-muted focus:outline-none"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="cursor-pointer p-0.5 text-cronos-muted hover:text-cronos-text" aria-label="Limpiar búsqueda">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
            <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
              {visible.length === 0 ? (
                <li className="px-4 py-5 text-center font-mono text-[11px] uppercase tracking-wider text-cronos-muted">Sin resultados</li>
              ) : (
                visible.map((option, i) => {
                  const selected = option.value === String(value);
                  return (
                    <li key={option.value || `opt-${i}`} role="option" aria-selected={selected} aria-disabled={option.disabled || undefined}>
                      <button
                        type="button"
                        disabled={option.disabled}
                        onClick={() => choose(option)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left font-sans text-xs transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40',
                          i === active ? 'bg-cronos-surface-1' : '',
                          selected ? 'border-l-2 border-cronos-bronze pl-3 text-cronos-text' : 'text-cronos-text',
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {selected && <Check className="h-3.5 w-3.5 shrink-0 stroke-[2] text-cronos-bronze" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
