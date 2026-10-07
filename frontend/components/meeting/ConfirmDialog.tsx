'use client';

import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  dangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  dangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-[360px] rounded-[12px] bg-[var(--panel-bg)] border border-[var(--panel-divider)] p-6 shadow-2xl">
        <h2 className="text-[15px] font-semibold text-white mb-2">{title}</h2>
        <p className="text-[13px] text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-[8px] bg-[#333] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#444] transition focus:outline-none focus:ring-2 focus:ring-[var(--blue-border)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`rounded-[8px] px-4 py-2 text-[13px] font-medium text-white transition focus:outline-none focus:ring-2 ${
              dangerous
                ? 'bg-[var(--end-red)] hover:opacity-90 focus:ring-red-500'
                : 'bg-[var(--blue-button)] hover:opacity-90 focus:ring-[var(--blue-border)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
