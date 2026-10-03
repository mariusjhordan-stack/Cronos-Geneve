import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default:
      'border-cronos-line bg-white text-cronos-muted',
    bronze:
      'border-cronos-bronze/40 bg-cronos-bronze/10 text-cronos-bronze',
    outline:
      'border-cronos-line bg-transparent text-cronos-muted',
    unique:
      'border-cronos-bronze/60 bg-cronos-surface-2 text-cronos-text font-medium',
    destructive:
      'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border px-2.5 py-1 text-[9px] uppercase font-mono tracking-[0.2em] transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
