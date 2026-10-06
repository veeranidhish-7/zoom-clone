'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { MeetingTabs } from '@/components/meetings/MeetingTabs';
import { MeetingRow } from '@/components/meetings/MeetingRow';
import { EmptyState } from '@/components/meetings/EmptyState';

interface Meeting {
  id: number;
  meeting_code: string;
  title: string;
  scheduled_start: string;
  duration_min: number;
  status: string;
}

export default function MeetingsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'previous' ? 'previous' : 'upcoming';
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    const fetchMeetings = async () => {
      try {
        const data = tab === 'upcoming' 
          ? await api.getUpcomingMeetings() 
          : await api.getRecentMeetings();
        if (isMounted) setMeetings(data as Meeting[]);
      } catch (err) {
        console.error('Failed to fetch meetings', err);
        if (isMounted) setMeetings([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMeetings();
    return () => { isMounted = false; };
  }, [tab]);

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-heading)]">Meetings</h1>
        <Link href="/meetings/schedule" className="bg-[var(--blue-web-tile)] text-white px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition">
          Schedule a Meeting
        </Link>
      </div>

      <MeetingTabs activeTab={tab} />

      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      ) : meetings.length > 0 ? (
        <div className="flex flex-col">
          {meetings.map((m) => (
            <MeetingRow key={m.id} meeting={m} isUpcoming={tab === 'upcoming'} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
