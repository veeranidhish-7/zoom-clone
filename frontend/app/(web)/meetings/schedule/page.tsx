import React from 'react';
import Link from 'next/link';
import { ScheduleForm } from '@/components/meetings/ScheduleForm';

export default function ScheduleMeetingPage() {
  return (
    <div className="max-w-[1000px] px-8 py-8">
      <div className="mb-4 flex items-center text-[13px] font-medium text-[var(--blue-button)]">
        <Link href="/meetings" className="hover:underline flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back to Meetings
        </Link>
      </div>
      <h1 className="text-[22px] font-bold text-[var(--text-heading)] mb-8">Schedule Meeting</h1>
      
      <ScheduleForm />
    </div>
  );
}
