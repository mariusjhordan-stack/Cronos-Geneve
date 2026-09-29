import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function NotificationToast() {
  const { notification, dismissNotification } = useCart();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isWarning = notification.type === 'warning';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md border border-cronos-line bg-cronos-surface p-4 shadow-2xl transition-all">
      <div className="flex items-start gap-3">
        {isSuccess && <CheckCircle2 className="h-4 w-4 text-cronos-bronze mt-0.5 shrink-0" />}
        {isWarning && <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />}
        {isError && <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />}
        {!isSuccess && !isWarning && !isError && <Info className="h-4 w-4 text-cronos-muted mt-0.5 shrink-0" />}

        <div className="flex-1 text-xs text-cronos-text font-sans leading-relaxed">
          {notification.message}
        </div>

        <button
          onClick={dismissNotification}
          className="text-cronos-muted hover:text-white p-0.5 focus:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
