'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function JoinMeetingPage() {
  const { code } = useParams();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const user = await api.getMe() as { name?: string };
        if (user && user.name) {
          setDisplayName(user.name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMe();
  }, []);

  const handleJoin = (camMicChoice: 'with' | 'without') => {
    if (!displayName.trim()) return;
    const meetingCode = Array.isArray(code) ? code[0] : code;
    // Pass choices via query params for UI only mode
    router.push(`/meeting/${meetingCode}?name=${encodeURIComponent(displayName)}&cam=${camMicChoice === 'with'}`);
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#0D0D0D]"></div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0D0D0D] font-[var(--font-body)]">
      {/* Name Input at bottom left as per some references, or we can just overlay it */}
      <div className="absolute bottom-6 left-6 z-10">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          className="rounded bg-black/50 px-3 py-2 text-white border border-[#2A2B2D] focus:border-[var(--blue-border)] focus:outline-none"
        />
      </div>

      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-md rounded-[12px] bg-[var(--panel-bg)] p-8 text-center text-white shadow-lg border border-[var(--panel-divider)]">
          <div className="mb-6 flex justify-center">
            {/* Placeholder for the illustration in the dialog */}
            <div className="h-32 w-40 rounded bg-gray-800 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Illustration</span>
            </div>
          </div>
          
          <h2 className="mb-2 text-[18px] font-semibold leading-tight">
            Do you want people to see you in the meeting?
          </h2>
          <p className="mb-6 text-[14px] text-gray-400">
            You can still turn off your microphone and camera anytime in the meeting
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleJoin('with')}
              disabled={!displayName.trim()}
              className="flex items-center justify-center gap-2 rounded-[8px] bg-[var(--blue-button)] py-2.5 text-[14px] font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z" />
              </svg>
              Use microphone and camera
            </button>
            <button
              onClick={() => handleJoin('without')}
              disabled={!displayName.trim()}
              className="rounded-[8px] py-2.5 text-[14px] font-medium text-[#4488FF] hover:bg-white/5 disabled:opacity-50"
            >
              Continue without microphone and camera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
