import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full border border-cronos-line bg-transparent px-3.5 py-2 text-xs text-cronos-text placeholder:text-cronos-muted/50 transition-colors focus:border-cronos-bronze focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 font-sans tracking-wide',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
