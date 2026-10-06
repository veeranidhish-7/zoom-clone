'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface JoinedParticipant {
  id: number;
  role: 'host' | 'participant';
  display_name: string;
  is_muted: boolean;
  is_video_off: boolean;
}

export interface JoinedMeeting {
  title: string;
  status: string;
}

interface MeetingContextValue {
  participant: JoinedParticipant | null;
  meeting: JoinedMeeting | null;
  camRequested: boolean;
  setJoinResult: (p: JoinedParticipant, m: JoinedMeeting, cam: boolean) => void;
  clear: () => void;
}

const MeetingContext = createContext<MeetingContextValue | null>(null);

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [participant, setParticipant] = useState<JoinedParticipant | null>(null);
  const [meeting, setMeeting] = useState<JoinedMeeting | null>(null);
  const [camRequested, setCamRequested] = useState(false);

  const setJoinResult = useCallback(
    (p: JoinedParticipant, m: JoinedMeeting, cam: boolean) => {
      setParticipant(p);
      setMeeting(m);
      setCamRequested(cam);
    },
    []
  );

  const clear = useCallback(() => {
    setParticipant(null);
    setMeeting(null);
    setCamRequested(false);
  }, []);

  return (
    <MeetingContext.Provider value={{ participant, meeting, camRequested, setJoinResult, clear }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeetingContext() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error('useMeetingContext must be used inside MeetingProvider');
  return ctx;
}
