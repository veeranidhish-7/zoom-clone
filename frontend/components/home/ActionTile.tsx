"use client";

import React from "react";

interface ActionTileProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  loading?: boolean;
  hasDropdown?: boolean;
}

export function ActionTile({ label, icon, color, onClick, loading, hasDropdown }: ActionTileProps) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <button
        onClick={onClick}
        disabled={loading}
        className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white transition-transform active:scale-95 disabled:opacity-80 disabled:active:scale-100 hover:brightness-110"
        style={{ backgroundColor: color, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
      </button>
      <div className="flex items-center gap-1 text-[13px] font-medium text-[var(--text-body)] cursor-pointer">
        {label}
        {hasDropdown && (
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
