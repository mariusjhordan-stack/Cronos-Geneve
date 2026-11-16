import React from 'react';
import { cn } from '@/lib/utils';

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium uppercase transition-[color,background-color,border-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text disabled:pointer-events-none disabled:opacity-40 disabled:bg-cronos-surface-2 disabled:text-cronos-muted rounded-none cursor-pointer select-none';

    const variants = {
      default:
        'bg-[#171717] text-white hover:bg-[#2B2B2B] font-medium tracking-[0.18em] shadow-none',
      primary:
        'bg-[#171717] text-white hover:bg-[#2B2B2B] font-medium tracking-[0.18em] shadow-none',
      // Jerarquía: primary/default = relleno negro; secondary/outline = contorno oscuro. Solo dos estilos de acción.
      secondary:
        'border border-cronos-text bg-transparent text-cronos-text hover:bg-cronos-text hover:text-white tracking-[0.18em]',
      outline:
        'border border-cronos-text bg-transparent text-cronos-text hover:bg-cronos-text hover:text-white tracking-[0.18em]',
      accent:
        'bg-cronos-bronze text-white hover:bg-cronos-bronze-hover font-medium tracking-[0.18em] shadow-none',
      ghost:
        'bg-transparent text-cronos-muted hover:text-cronos-text hover:bg-black/[0.04] tracking-[0.16em]',
      link:
        'text-cronos-text underline-offset-4 hover:underline hover:text-cronos-bronze tracking-[0.16em] p-0 h-auto',
      minimal:
        'border-b border-cronos-bronze text-cronos-text hover:text-cronos-bronze pb-1 tracking-[0.2em] rounded-none bg-transparent',
      editorial:
        'border border-cronos-text bg-transparent text-cronos-text hover:bg-cronos-text hover:text-white tracking-[0.22em] rounded-none shadow-none',
    };

    const sizes = {
      default: 'h-11 px-6 py-2.5 text-xs tracking-[0.18em]',
      sm: 'h-8 px-3.5 text-[11px] tracking-[0.16em]',
      lg: 'h-12 px-8 py-3.5 text-xs tracking-[0.22em]',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
