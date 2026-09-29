import React, { useEffect } from 'react';
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer Container */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col border-l border-cronos-line bg-cronos-surface text-cronos-text shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, children, onClose }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-cronos-line p-5', className)}>
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-cronos-muted hover:text-white transition-colors p-1.5 focus:outline-none"
          title="Fermer"
        >
          <X className="h-4 w-4 stroke-[1.5]" />
        </button>
      )}
    </div>
  );
}

export function SheetTitle({ className, children }) {
  return (
    <h2 className={cn('font-serif text-xl tracking-[0.08em] text-white uppercase', className)}>
      {children}
    </h2>
  );
}

export function SheetDescription({ className, children }) {
  return (
    <p className={cn('text-[11px] font-mono tracking-widest text-cronos-muted uppercase mt-0.5', className)}>
      {children}
    </p>
  );
}

export function SheetContent({ className, children }) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-5', className)}>
      {children}
    </div>
  );
}

export function SheetFooter({ className, children }) {
  return (
    <div className={cn('border-t border-cronos-line p-5 bg-cronos-surface-2/60', className)}>
      {children}
    </div>
  );
}
