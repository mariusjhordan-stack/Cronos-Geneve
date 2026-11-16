import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Casilla personalizada: caja negra al marcar, con la marca en bronce.
 * Es un <input type="checkbox"> real (accesible por teclado) con el aspecto pintado encima.
 */
export const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <span className={cn('relative mt-0.5 inline-flex h-4 w-4 shrink-0', className)}>
    <input
      ref={ref}
      type="checkbox"
      className="peer h-4 w-4 cursor-pointer appearance-none rounded-none border border-cronos-line bg-white transition-colors duration-200 checked:border-[#171717] checked:bg-[#171717] hover:border-cronos-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cronos-bronze focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
    <Check
      className="pointer-events-none absolute inset-0 m-auto h-3 w-3 stroke-[3] text-cronos-bronze-light opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
      aria-hidden="true"
    />
  </span>
));

Checkbox.displayName = 'Checkbox';
