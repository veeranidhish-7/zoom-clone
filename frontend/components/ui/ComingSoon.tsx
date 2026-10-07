import React from 'react';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  icon: React.ReactNode;
  description?: string;
}

export function ComingSoon({ title, icon, description = "This feature isn't part of this demo" }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
      <div className="text-[var(--text-muted)] mb-4 w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl shadow-sm">
        {icon}
      </div>
      <h1 className="text-2xl font-semibold text-[var(--text-heading)] mb-2">{title}</h1>
      <p className="text-[var(--text-muted)] mb-8">{description}</p>
      <Link href="/" className="bg-[var(--blue-button)] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--blue-button)]">
        Back to Home
      </Link>
    </div>
  );
}
