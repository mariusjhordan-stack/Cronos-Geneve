import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export function Sheet({ open, onOpenChange, children }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onOpenChange(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [open, onOpenChange]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Velo traslúcido institucional animado */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.25 }}
            className="fixed inset-0 bg-[#171717]/40 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
          />

          {/* Contenedor lateral con deslizamiento suave */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-50 flex h-full w-full max-w-md flex-col rounded-none border-l border-cronos-line bg-white text-cronos-text shadow-modal"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function SheetHeader({ className, children, onClose }) {
  return (
    <div
      className={cn('flex items-center justify-between border-b border-cronos-line p-6', className)}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer p-1.5 text-cronos-muted transition-colors hover:text-cronos-text focus:outline-none"
          aria-label="Cerrar panel lateral"
        >
          <X className="h-4 w-4 stroke-[1.4]" />
        </button>
      )}
    </div>
  );
}

export function SheetTitle({ className, children }) {
  return (
    <h2 className={cn('font-serif text-xl tracking-[0.08em] text-cronos-text uppercase', className)}>
      {children}
    </h2>
  );
}

export function SheetDescription({ className, children }) {
  return (
    <p
      className={cn(
        'mt-1 font-mono text-[11px] uppercase tracking-widest text-cronos-muted',
        className
      )}
    >
      {children}
    </p>
  );
}

export function SheetContent({ className, children }) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-6 py-4 scrollbar-none', className)}>
      {children}
    </div>
  );
}

export function SheetFooter({ className, children }) {
  return (
    <div className={cn('border-t border-cronos-line bg-cronos-bg/40 p-6', className)}>
      {children}
    </div>
  );
}
