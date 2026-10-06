'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function JoinMeetingRedirect() {
  const { code } = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateCode() {
      try {
        const meetingCode = (Array.isArray(code) ? code[0] : code) || '';
        await api.getMeeting(meetingCode);
        router.push(`/meeting/${meetingCode}/join`);
      } catch (err) {
        const errorObj = err as { status?: number };
        if (errorObj.status === 404) {
          setError('Meeting not found');
        } else if (errorObj.status === 410) {
          setError('Meeting has ended');
        } else {
          setError('Failed to validate meeting');
        }
      }
    }
    
    if (code) {
      validateCode();
    }
  }, [code, router]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white">
        <h1 className="mb-4 text-2xl font-semibold text-[var(--text-heading)]">{error}</h1>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg bg-[var(--blue-button)] px-4 py-2 text-white hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <p className="text-[var(--text-muted)]">Validating meeting code...</p>
    </div>
  );
}
