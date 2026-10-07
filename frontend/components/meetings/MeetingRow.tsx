import React from 'react';
import Link from 'next/link';
import { formatMeetingTime, formatMeetingId, formatDuration } from '@/lib/format';

interface Meeting {
  id: number;
  meeting_code: string;
  title: string;
  scheduled_start: string;
  duration_min: number;
  status: string;
}

interface MeetingRowProps {
  meeting: Meeting;
  isUpcoming?: boolean;
}

export const MeetingRow: React.FC<MeetingRowProps> = ({ meeting, isUpcoming }) => {
  const timeStr = formatMeetingTime(meeting.scheduled_start);
  const timeParts = timeStr.split(', ');
  
  let datePart = timeParts[0];
  let timePart = timeParts[1];
  if (timeParts.length > 2) {
    datePart = `${timeParts[0]}, ${timeParts[1]}`;
    timePart = timeParts[2];
  }

  return (
    <div className="relative flex flex-col md:flex-row md:items-center py-4 border-b border-[var(--divider-2)] hover:bg-[#F9F9FB] transition group">
      <Link href={`/meetings/${meeting.meeting_code}`} className="absolute inset-0 z-0" aria-label={`View details for ${meeting.title}`} />
      <div className="w-48 mb-2 md:mb-0 flex-shrink-0 text-sm">
        <div className="text-[var(--text-body)] font-semibold">{datePart}</div>
        <div className="text-[var(--text-muted)]">{timePart}</div>
      </div>
      <div className="flex-1 flex flex-col items-start min-w-0 z-10 pointer-events-none">
        <span className="text-[var(--blue-button)] font-semibold text-base truncate group-hover:underline">
          {meeting.title}
        </span>
        <div className="text-[var(--text-muted)] text-sm mt-1">
          Meeting ID: {formatMeetingId(meeting.meeting_code)}
        </div>
      </div>
      <div className="w-32 flex-shrink-0 mt-3 md:mt-0 md:text-right z-10">
        {isUpcoming && (
          <Link href={`/meeting/${meeting.meeting_code}/join`} className="inline-block bg-[var(--blue-web-tile)] text-white px-5 py-1.5 rounded text-sm font-medium hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--blue-button)] transition">
            Start
          </Link>
        )}
      </div>
    </div>
  );
};
