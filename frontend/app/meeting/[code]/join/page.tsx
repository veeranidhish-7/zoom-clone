'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useMeetingContext } from '@/hooks/useMeetingContext';
import { useToast } from '@/components/ui/useToast';

export default function JoinMeetingPage() {
  const { code } = useParams();
  const router = useRouter();
  const meetingCode = Array.isArray(code) ? code[0] : code ?? '';
  const { setJoinResult } = useMeetingContext();
  const { toast: addToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const user = await api.getMe() as { name?: string };
        if (user?.name) setDisplayName(user.name);
      } catch {
        // not fatal
      } finally {
        setIsLoading(false);
      }
    }
    fetchMe();
  }, []);

  const handleJoin = async (camChoice: 'with' | 'without') => {
    if (!displayName.trim() || isJoining) return;
    setIsJoining(true);
    setJoinError(null);
    try {
      const res = await api.joinMeeting(meetingCode, { display_name: displayName.trim() }) as {
        participant: { id: number; role: string; display_name: string; is_muted: boolean; is_video_off: boolean };
        meeting: { title: string; status: string };
      };
      setJoinResult(
        { id: res.participant.id, role: res.participant.role as 'host' | 'participant', display_name: res.participant.display_name, is_muted: res.participant.is_muted, is_video_off: res.participant.is_video_off },
        { title: res.meeting.title, status: res.meeting.status },
        camChoice === 'with'
      );
      router.push(`/meeting/${meetingCode}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to join meeting';
      setJoinError(msg);
      addToast(msg, 'error');
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#0D0D0D]" />;
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0D0D0D] font-[var(--font-body)]">


      {/* Back link */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back
        </button>
      </div>

      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-md rounded-[12px] bg-[var(--panel-bg)] p-8 text-center text-white shadow-lg border border-[var(--panel-divider)]">
          {/* Camera illustration */}
          <div className="mb-6 flex justify-center">
            <div className="h-32 w-40 rounded-[12px] bg-gray-800 flex items-center justify-center relative overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="text-gray-600">
                <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
              </svg>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-1 text-left">
            <label className="text-sm font-medium text-gray-300">Your name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleJoin('without'); }}
              placeholder="Enter your name"
              className="rounded-[8px] bg-black/50 px-3 py-2.5 text-white border border-[#2A2B2D] focus:border-[var(--blue-border)] focus:outline-none w-full transition"
            />
          </div>

          <h2 className="mb-2 text-[18px] font-semibold leading-tight">
            Do you want people to see you in the meeting?
          </h2>
          <p className="mb-6 text-[14px] text-gray-400">
            You can still turn off your microphone and camera anytime in the meeting
          </p>

          {joinError && (
            <div className="mb-4 rounded-[8px] bg-red-900/40 border border-red-500/50 px-3 py-2 text-sm text-red-300">
              {joinError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleJoin('with')}
              disabled={!displayName.trim() || isJoining}
              className="flex items-center justify-center gap-2 rounded-[8px] bg-[var(--blue-button)] py-2.5 text-[14px] font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {isJoining ? (
                <span className="animate-pulse">Joining…</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
                  </svg>
                  Use microphone and camera
                </>
              )}
            </button>
            <button
              onClick={() => handleJoin('without')}
              disabled={!displayName.trim() || isJoining}
              className="rounded-[8px] py-2.5 text-[14px] font-medium text-[#4488FF] hover:bg-white/5 disabled:opacity-50 transition"
            >
              Continue without microphone and camera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
