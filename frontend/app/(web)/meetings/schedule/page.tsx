import React from 'react';
import Link from 'next/link';
import { ScheduleForm } from '@/components/meetings/ScheduleForm';

export default function ScheduleMeetingPage() {
  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="mb-6 flex items-center text-sm font-medium text-[var(--blue-button)]">
        <Link href="/meetings" className="hover:underline">&lt; Back to Meetings</Link>
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-8">Schedule Meeting</h1>
      
      <ScheduleForm />
    </div>
  );
}
