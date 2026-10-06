'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

export interface Participant {
  id: number;
  display_name: string;
  role: 'host' | 'participant';
  is_muted: boolean;
  is_video_off: boolean;
  status: string;
}

interface UseParticipantsOptions {
  code: string;
  myId: number | null;
  onRemoved: () => void;
  onMeetingEnded: () => void;
  onError: (msg: string) => void;
}

export function useParticipants({
  code,
  myId,
  onRemoved,
  onMeetingEnded,
  onError,
}: UseParticipantsOptions) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(false);

  const fetchParticipants = useCallback(async () => {
    if (stoppedRef.current) return;
    try {
      const data = (await api.getParticipants(code)) as Participant[];
      setParticipants(data);

      // Check if I was removed
      if (myId !== null) {
        const me = data.find((p) => p.id === myId);
        if (me && me.status === 'removed') {
          stoppedRef.current = true;
          onRemoved();
          return;
        }
        // If I'm not in the list at all (could be removed or left)
        // Only trigger removal if I was previously present and now gone
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        // Meeting ended
        stoppedRef.current = true;
        onMeetingEnded();
      } else {
        onError('Could not fetch participants — check your connection');
      }
    }
  }, [code, myId, onRemoved, onMeetingEnded, onError]);

  useEffect(() => {
    if (!code) return;
    stoppedRef.current = false;

    // Initial fetch
    fetchParticipants();

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (document.hidden) return; // pause when tab hidden
        fetchParticipants();
      }, 3000);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (!document.hidden && !stoppedRef.current) {
        // Tab became visible again — fetch immediately
        fetchParticipants();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stoppedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [code, fetchParticipants]);

  return participants;
}
