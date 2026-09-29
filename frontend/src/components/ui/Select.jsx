import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative inline-block w-full">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none border border-cronos-line bg-cronos-surface/80 px-3.5 pr-8 py-2 text-xs text-cronos-text tracking-wide transition-colors focus:border-cronos-bronze focus:outline-none cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-cronos-muted">
        <ChevronDown className="h-3.5 w-3.5 stroke-[1.5]" />
      </div>
    </div>
  );
});

Select.displayName = 'Select';
