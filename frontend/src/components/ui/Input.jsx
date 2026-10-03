import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-none border border-cronos-line bg-white px-3.5 py-2 text-xs font-sans tracking-wide text-cronos-text placeholder:text-cronos-muted transition-colors duration-150 focus:border-cronos-text focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-cronos-surface-2 disabled:text-cronos-muted disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
