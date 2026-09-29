import React from 'react';
import { cn } from '@/lib/utils';

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center text-xs font-medium tracking-widest uppercase transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cronos-bronze disabled:pointer-events-none disabled:opacity-40';

    const variants = {
      default:
        'bg-cronos-bronze text-[#111214] hover:bg-cronos-bronze-hover font-semibold tracking-[0.2em]',
      outline:
        'border border-white/15 bg-transparent text-cronos-text hover:border-cronos-bronze hover:text-white tracking-[0.18em]',
      ghost:
        'bg-transparent text-cronos-muted hover:text-cronos-text hover:bg-white/5 tracking-[0.16em]',
      secondary:
        'bg-cronos-surface text-cronos-text border border-cronos-line hover:border-white/20 tracking-[0.16em]',
      link:
        'text-cronos-bronze underline-offset-4 hover:underline tracking-[0.16em] p-0 h-auto',
      minimal:
        'border-b border-cronos-bronze text-cronos-text hover:text-cronos-bronze pb-1 tracking-[0.2em] rounded-none',
    };

    const sizes = {
      default: 'h-11 px-6 py-2.5',
      sm: 'h-8 px-3 text-[10px] tracking-[0.16em]',
      lg: 'h-13 px-8 py-3.5 text-xs tracking-[0.22em]',
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
