'use client';
import Link from 'next/link';

export default function MeetingEnded() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-[var(--text-heading)] mb-6">Meeting ended</h1>
      <Link href="/" className="bg-[var(--blue-button)] text-white px-6 py-2 rounded font-medium hover:opacity-90">
        Return to Home
      </Link>
    </div>
  );
}
