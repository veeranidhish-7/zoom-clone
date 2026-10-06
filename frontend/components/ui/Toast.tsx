'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'info' | 'success';
}

interface ToastContextValue {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'error') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() =>
            setToasts((prev) => prev.filter((x) => x.id !== t.id))
          } />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const colorMap = {
    error: 'bg-red-600',
    info: 'bg-[var(--blue-button)]',
    success: 'bg-green-600',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm text-white shadow-lg ${colorMap[toast.type]} animate-in slide-in-from-bottom-4 duration-200`}
    >
      <span>{toast.message}</span>
      <button onClick={onDismiss} className="ml-2 text-white/70 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
