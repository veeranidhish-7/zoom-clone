'use client';
import React, { useState } from 'react';
import { Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  iconOnly?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label, iconOnly }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <>
      {iconOnly ? (
        <button 
          onClick={handleCopy}
          className="p-1 text-[var(--text-muted)] hover:bg-gray-100 rounded transition"
          title="Copy"
        >
          <Copy size={16} />
        </button>
      ) : (
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--divider)] rounded bg-white text-[var(--text-body)] hover:bg-gray-50 transition font-medium text-sm"
        >
          <Copy size={16} />
          {label || "Copy Invitation"}
        </button>
      )}
      
      {copied && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 text-sm">
          Copied
        </div>
      )}
    </>
  );
};
