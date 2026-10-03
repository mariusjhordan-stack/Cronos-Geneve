import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sheet({ open, onOpenChange, children }) {
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

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Velo traslúcido institucional */}
      <div
        className="fixed inset-0 bg-[#171717]/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Contenedor lateral con borde milimétrico */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col rounded-none border-l border-cronos-line bg-white text-cronos-text shadow-modal">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function SheetHeader({ className, children, onClose }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-cronos-line p-6', className)}>
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-cronos-muted hover:text-cronos-text transition-colors p-1.5 focus:outline-none"
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
    <p className={cn('text-[10px] font-mono tracking-widest text-cronos-muted uppercase mt-1', className)}>
      {children}
    </p>
  );
}

export function SheetContent({ className, children }) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-6', className)}>
      {children}
    </div>
  );
}

export function SheetFooter({ className, children }) {
  return (
    <div className={cn('border-t border-cronos-line p-6 bg-cronos-surface-2', className)}>
      {children}
    </div>
  );
}
