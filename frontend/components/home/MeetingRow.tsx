import { formatMeetingTime, formatMeetingId } from "@/lib/format";
import React from "react";
import Link from "next/link";

export function MeetingRow({ meeting }: { meeting: Record<string, unknown> }) {
  return (
    <Link href={`/meetings/${meeting.meeting_code}`} className="flex flex-col py-3 border-b border-[var(--divider-2)] last:border-b-0 group hover:bg-[#F9F9F9] -mx-4 px-4 transition-colors cursor-pointer">
      <div className="flex justify-between items-start mb-1 gap-2">
        <h3 className="font-medium text-[var(--text-heading)] text-[15px] truncate flex-1 min-w-0 pr-2 group-hover:text-[var(--blue-button)] transition-colors">
          {(meeting.title as string) || "Zoom Meeting"}
        </h3>
        <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap shrink-0">
          {formatMeetingTime((meeting.scheduled_start as string) || (meeting.created_at as string))}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
        <span>Meeting ID: {formatMeetingId(meeting.meeting_code as string)}</span>
      </div>
    </Link>
  );
}
