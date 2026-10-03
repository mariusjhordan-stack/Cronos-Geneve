import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative inline-block w-full">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-none border border-cronos-line bg-white px-3.5 pr-9 py-2 text-xs font-sans tracking-wide text-cronos-text transition-colors duration-150 focus:border-cronos-text focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-cronos-surface-2 disabled:text-cronos-muted disabled:opacity-60',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-cronos-muted">
        <ChevronDown className="h-3.5 w-3.5 stroke-[1.4]" />
      </div>
    </div>
  );
});

Select.displayName = 'Select';
