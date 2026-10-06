'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function EndedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'Meeting ended';

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white font-[var(--font-body)] text-[var(--text-heading)]">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blue-tint)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="text-[var(--blue-button)]">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">Meeting ended</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-xs">{reason}</p>
      </div>
      <button
        onClick={() => router.push('/')}
        className="mt-2 rounded-[8px] bg-[var(--blue-button)] px-6 py-2.5 text-[14px] font-medium text-white hover:opacity-90 transition shadow-sm"
      >
        Return to Home
      </button>
    </div>
  );
}

export default function MeetingEndedPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-white" />}>
      <EndedContent />
    </Suspense>
  );
}
