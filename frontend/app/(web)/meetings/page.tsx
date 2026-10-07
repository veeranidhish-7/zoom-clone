'use client';

import React, { useEffect, useState, Suspense } from 'react';
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

function MeetingsContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab = ['upcoming', 'previous', 'attachments', 'personal', 'templates', 'agendas'].includes(rawTab || '') 
    ? (rawTab as string) 
    : 'upcoming';
  
  const q = searchParams.get('q') || '';
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filteredMeetings = meetings.filter(m => m.title.toLowerCase().includes(q.toLowerCase()));

  const isImplemented = tab === 'upcoming' || tab === 'previous';

  useEffect(() => {
    let isMounted = true;
    
    const fetchMeetings = async () => {
      if (!isImplemented) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
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
  }, [tab, isImplemented]);

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-heading)]">Meetings</h1>
        <Link href="/meetings/schedule" className="bg-[var(--blue-web-tile)] text-white px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--blue-button)] transition-all">
          Schedule a Meeting
        </Link>
      </div>

      <MeetingTabs activeTab={tab} />

      {!isImplemented ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          <p className="text-lg font-medium text-[var(--text-heading)]">Coming Soon</p>
          <p className="text-sm mt-1">This feature isn't part of this demo</p>
        </div>
      ) : isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      ) : meetings.length > 0 ? (
        filteredMeetings.length > 0 ? (
          <div className="flex flex-col">
            {filteredMeetings.map((m) => (
              <MeetingRow key={m.id} meeting={m} isUpcoming={tab === 'upcoming'} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <p className="text-lg font-medium text-[var(--text-heading)]">No results found</p>
            <p className="text-sm">We couldn't find any meetings matching "{q}"</p>
          </div>
        )
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingsContent />
    </Suspense>
  );
}
