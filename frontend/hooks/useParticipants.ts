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

  // Stable refs for callbacks — updated every render so they are always current,
  // but their identity never changes, so fetchParticipants never needs to recreate.
  const onRemovedRef = useRef(onRemoved);
  const onMeetingEndedRef = useRef(onMeetingEnded);
  const onErrorRef = useRef(onError);
  useEffect(() => { onRemovedRef.current = onRemoved; });
  useEffect(() => { onMeetingEndedRef.current = onMeetingEnded; });
  useEffect(() => { onErrorRef.current = onError; });

  // myId can change (null → number) once; keep a ref so fetchParticipants
  // reads the latest value without recreating.
  const myIdRef = useRef(myId);
  useEffect(() => { myIdRef.current = myId; });

  // fetchParticipants is stable (only depends on `code` which is constant per room).
  const fetchParticipants = useCallback(async () => {
    if (stoppedRef.current) return;
    try {
      const data = (await api.getParticipants(code)) as Participant[];
      setParticipants(data);

      if (myIdRef.current !== null) {
        const me = data.find((p) => p.id === myIdRef.current);
        if (!me || me.status === 'removed') {
          stoppedRef.current = true;
          onRemovedRef.current();
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        stoppedRef.current = true;
        onMeetingEndedRef.current();
      } else {
        onErrorRef.current('Could not fetch participants — check your connection');
      }
    }
  }, [code]); // only code — all callbacks are read through stable refs

  useEffect(() => {
    if (!code) return;
    stoppedRef.current = false;

    fetchParticipants();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (document.hidden) return;
      fetchParticipants();
    }, 3000);

    const handleVisibilityChange = () => {
      if (!document.hidden && !stoppedRef.current) {
        fetchParticipants();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stoppedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [code, fetchParticipants]); // fetchParticipants is stable → effect runs once

  return participants;
}
