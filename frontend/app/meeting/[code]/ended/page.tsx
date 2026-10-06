'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function MeetingEndedPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-white font-[var(--font-body)] text-[var(--text-heading)]">
      <h1 className="mb-6 text-3xl font-semibold">Meeting ended</h1>
      <button 
        onClick={() => router.push('/')}
        className="rounded-[8px] bg-[var(--blue-button)] px-6 py-2.5 text-[14px] font-medium text-white hover:opacity-90 transition shadow-sm"
      >
        Return to Home
      </button>
    </div>
  );
}
