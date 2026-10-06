'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatMeetingTime, formatMeetingId, formatDuration } from '@/lib/format';
import { CopyButton } from '@/components/meetings/CopyButton';
import { ConfirmDialog } from '@/components/meetings/ConfirmDialog';
import { ScheduleForm } from '@/components/meetings/ScheduleForm';

interface Meeting {
  id: number;
  meeting_code: string;
  title: string;
  scheduled_start: string;
  duration_min: number;
  status: string;
  description: string;
}

export default function MeetingDetailPage() {
  const { code } = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'attachments'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  
  const fetchMeeting = async () => {
    try {
      setIsLoading(true);
      const data: any = await api.getMeeting(code as string);
      setMeeting(data);
      setJoinUrl(`${window.location.origin}/j/${data.meeting_code}`);
    } catch (err: any) {
      if (err.status === 404) {
        setError('Meeting not found');
      } else if (err.status === 410) {
        setError('Meeting has ended');
      } else {
        setError('Failed to load meeting');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [code]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteMeeting(code as string);
      router.push('/meetings');
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  
  if (error || !meeting) {
    return (
      <div className="max-w-5xl mx-auto py-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">{error}</h2>
        <Link href="/meetings" className="text-[var(--blue-button)] hover:underline">
          Return to Meetings
        </Link>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-5xl mx-auto py-4">
        <div className="mb-6 flex items-center text-sm font-medium text-[var(--blue-button)]">
          <button onClick={() => setIsEditing(false)} className="hover:underline">&lt; Back</button>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-8">Edit Meeting</h1>
        <ScheduleForm 
          initialData={{
            code: meeting.meeting_code,
            title: meeting.title,
            description: meeting.description || '',
            scheduled_start: meeting.scheduled_start,
            duration_min: meeting.duration_min,
          }}
          onSuccess={() => {
            setIsEditing(false);
            fetchMeeting();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="mb-6 flex items-center text-sm font-medium text-[var(--blue-button)]">
        <Link href="/meetings" className="hover:underline">My Meetings</Link>
        <span className="mx-2 text-[var(--text-muted)]">&gt;</span>
        <span className="text-[var(--text-body)]">Manage "{meeting.title}"</span>
      </div>

      <div className="flex gap-4 border-b border-[var(--divider)] mb-8">
        <button 
          className={`pb-3 px-4 rounded-t-md font-medium text-sm transition ${activeTab === 'details' ? 'bg-[var(--blue-tint)] text-[var(--blue-button)] border-b-2 border-[var(--blue-button)]' : 'text-[var(--text-body)] hover:bg-gray-50'}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`pb-3 px-4 rounded-t-md font-medium text-sm transition ${activeTab === 'attachments' ? 'bg-[var(--blue-tint)] text-[var(--blue-button)] border-b-2 border-[var(--blue-button)]' : 'text-[var(--text-body)] hover:bg-gray-50'}`}
          onClick={() => setActiveTab('attachments')}
        >
          Attachments
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="space-y-8">
          <div className="grid grid-cols-[150px_1fr] gap-4 text-sm">
            <div className="font-medium text-[var(--text-body)]">Topic</div>
            <div className="font-semibold text-base">{meeting.title}</div>

            <div className="font-medium text-[var(--text-body)]">Time</div>
            <div>{formatMeetingTime(meeting.scheduled_start)}</div>

            <div className="font-medium text-[var(--text-body)]">Duration</div>
            <div>{formatDuration(meeting.duration_min)}</div>

            <div className="font-medium text-[var(--text-body)]">Meeting ID</div>
            <div className="font-semibold">{formatMeetingId(meeting.meeting_code)}</div>

            <div className="font-medium text-[var(--text-body)]">Invite Link</div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <a href={joinUrl} className="text-[var(--blue-button)] hover:underline truncate max-w-sm">
                {joinUrl}
              </a>
              <CopyButton text={joinUrl} />
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--divider)] flex gap-4">
            <Link 
              href={`/meeting/${meeting.meeting_code}/join`}
              className="bg-[var(--blue-button)] text-white px-6 py-2 rounded font-medium hover:opacity-90 transition"
            >
              Start
            </Link>
            <button 
              onClick={() => setIsEditing(true)}
              className="border border-[var(--divider)] text-[var(--text-body)] px-6 py-2 rounded font-medium hover:bg-gray-50 transition"
            >
              Edit
            </button>
            <button 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="border border-[var(--divider)] text-[var(--text-body)] px-6 py-2 rounded font-medium hover:bg-gray-50 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="py-8 text-center text-[var(--text-muted)] text-sm">
          No attachments available.
        </div>
      )}

      <ConfirmDialog 
        isOpen={isDeleteDialogOpen}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        confirmText="Delete"
        isDeleting={isDeleting}
      />
    </div>
  );
}
