import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default:
      'border-cronos-line bg-cronos-surface text-cronos-muted',
    bronze:
      'border-cronos-bronze/40 bg-cronos-bronze/10 text-cronos-bronze',
    outline:
      'border-cronos-line bg-transparent text-cronos-muted',
    unique:
      'border-cronos-bronze/60 bg-transparent text-cronos-bronze font-medium',
    destructive:
      'border-red-900/40 bg-red-950/20 text-red-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border px-2.5 py-1 text-[10px] uppercase font-mono tracking-[0.2em] transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
