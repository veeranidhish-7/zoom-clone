import { formatMeetingTime, formatMeetingId } from "@/lib/format";
import React from "react";

export function MeetingRow({ meeting }: { meeting: Record<string, unknown> }) {
  return (
    <div className="flex flex-col py-3 border-b border-[var(--divider-2)] last:border-b-0 group hover:bg-[#F9F9F9] -mx-4 px-4 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-medium text-[var(--text-heading)] text-[15px] truncate pr-4">
          {(meeting.title as string) || "Zoom Meeting"}
        </h3>
        <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">
          {formatMeetingTime((meeting.scheduled_start as string) || (meeting.created_at as string))}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
        <span>Meeting ID: {formatMeetingId(meeting.meeting_code as string)}</span>
      </div>
    </div>
  );
}
