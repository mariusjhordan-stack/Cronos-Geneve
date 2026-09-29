import React, { useEffect } from 'react';
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
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-xl border border-cronos-line bg-cronos-surface p-6 text-cronos-text shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children, onClose }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-cronos-line pb-4 mb-4', className)}>
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-cronos-muted hover:text-white transition-colors p-1"
        >
          <X className="h-4 w-4 stroke-[1.5]" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ className, children }) {
  return (
    <h3 className={cn('font-serif text-lg tracking-wider text-white uppercase', className)}>
      {children}
    </h3>
  );
}
