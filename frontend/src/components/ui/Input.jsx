import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-none border-0 border-b border-cronos-line bg-transparent px-0 py-3 text-sm font-sans tracking-wide text-cronos-text placeholder:text-cronos-muted transition-colors duration-150 focus:border-cronos-text focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
