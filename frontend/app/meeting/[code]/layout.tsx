import React from 'react';
import { MeetingProvider } from '@/hooks/useMeetingContext';

export default function MeetingLayout({ children }: { children: React.ReactNode }) {
  return <MeetingProvider>{children}</MeetingProvider>;
}
