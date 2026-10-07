import React from 'react';

export function FormRow({ label, children, error, required = false }: { label: string, children: React.ReactNode, error?: string, required?: boolean }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start py-4">
      <div className="w-[200px] shrink-0 pt-2 text-[var(--text-body)] text-sm font-medium flex gap-1">
        {required && <span className="text-red-500">*</span>}
        {label}
      </div>
      <div className="flex-1 flex flex-col gap-1 w-full max-w-2xl">
        {children}
        {error && <div className="flex gap-2 items-center text-[#E02828] text-xs mt-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>}
      </div>
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props}
      className={`w-full border border-[var(--divider)] hover:border-gray-400 focus:border-[var(--blue-button)] focus:ring-1 focus:ring-[var(--blue-button)] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${props.className || ''}`}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select 
        {...props}
        className={`w-full appearance-none border border-[var(--divider)] hover:border-gray-400 focus:border-[var(--blue-button)] focus:ring-1 focus:ring-[var(--blue-button)] rounded-lg pl-3 pr-8 py-2.5 text-sm outline-none transition-colors bg-white ${props.className || ''}`}
      >
        {props.children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
    </div>
  );
}
