"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { MeetingRow } from "./MeetingRow";

interface MeetingListProps {
  type: "upcoming" | "recent";
}

export function MeetingList({ type }: MeetingListProps) {
  const [meetings, setMeetings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = type === "upcoming" ? await api.getUpcomingMeetings() : await api.getRecentMeetings();
        if (mounted) setMeetings(data as Record<string, unknown>[]);
      } catch (err) {
        console.error("Failed to fetch meetings", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMeetings();
    return () => { mounted = false; };
  }, [type]);

  const title = type === "upcoming" ? "Upcoming Meetings" : "Recent Activity";

  return (
    <div className="bg-white rounded-xl border border-[var(--divider)] p-4 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-lg text-[var(--text-heading)]">{title}</h2>
      </div>

      <div className="flex flex-col">
        {loading ? (
          <div className="flex flex-col gap-4 py-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-[#E7F1FD] rounded-full flex items-center justify-center mb-3 text-[var(--blue-tile)]">
              {type === "upcoming" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              )}
            </div>
            <p className="text-[var(--text-muted)] text-sm font-medium">No {type} meetings</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {meetings.map((m) => (
              <MeetingRow key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
