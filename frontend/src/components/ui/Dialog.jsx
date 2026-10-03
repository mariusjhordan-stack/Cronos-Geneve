import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dialog({ open, onOpenChange, children }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Velo traslúcido sobrio para modal */}
      <div
        className="fixed inset-0 bg-[#171717]/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Contenedor con borde fino y superficie blanca */}
      <div className="relative z-50 w-full max-w-xl rounded-none border border-cronos-line bg-white p-6 sm:p-8 text-cronos-text shadow-modal">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ className, children, onClose }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-cronos-line pb-4 mb-5', className)}>
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-cronos-muted hover:text-cronos-text transition-colors p-1.5 focus:outline-none"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4 stroke-[1.4]" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ className, children }) {
  return (
    <h3 className={cn('font-serif text-xl tracking-[0.06em] text-cronos-text uppercase', className)}>
      {children}
    </h3>
  );
}
