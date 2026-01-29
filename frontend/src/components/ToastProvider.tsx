import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastType = 'info' | 'success' | 'error' | 'pending';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  dismissPendingToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Pending toasts stay longer so they're visible while tx confirms; others 3s
    const dismissMs = type === 'pending' ? 8000 : 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, dismissMs);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissPendingToasts = useCallback(() => {
    setToasts((prev) => prev.filter((toast) => toast.type !== 'pending'));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissPendingToasts }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-lg shadow-black/40 ${
              toast.type === 'success'
                ? 'border border-emerald-500/50 bg-emerald-900/70 text-emerald-100'
                : toast.type === 'error'
                ? 'border border-red-500/50 bg-red-900/70 text-red-100'
                : toast.type === 'pending'
                ? 'border border-amber-500/50 bg-amber-900/60 text-amber-100'
                : 'border border-slate-500/50 bg-slate-900/80 text-slate-100'
            }`}
          >
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
              className="text-lg leading-none text-slate-200 hover:text-white focus:outline-none"
              onClick={() => dismissToast(toast.id)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

