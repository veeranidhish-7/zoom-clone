'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/useToast';

interface InviteDialogProps {
  meetingCode: string;
  onClose: () => void;
}

export default function InviteDialog({ meetingCode, onClose }: InviteDialogProps) {
  const { toast: addToast } = useToast();
  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/meeting/${meetingCode}/join`
    : '';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      addToast('Invite link copied!', 'success');
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(meetingCode);
      addToast('Meeting ID copied!', 'success');
    } catch {
      addToast('Failed to copy meeting ID', 'error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Invite participants"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[420px] rounded-[12px] bg-[var(--panel-bg)] border border-[var(--panel-divider)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-white">Invite Participants</h2>
          <button
            onClick={onClose}
            aria-label="Close invite dialog"
            className="rounded p-1 text-gray-400 hover:text-white hover:bg-[#333] transition focus:outline-none focus:ring-2 focus:ring-[var(--blue-border)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Meeting ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-[8px] bg-[#1a1a1a] px-3 py-2 text-[14px] font-mono text-white tracking-widest border border-[var(--panel-divider)]">
                {meetingCode}
              </code>
              <button
                onClick={copyId}
                aria-label="Copy meeting ID"
                className="flex items-center gap-1.5 rounded-[8px] bg-[#333] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#444] transition focus:outline-none focus:ring-2 focus:ring-[var(--blue-border)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy
              </button>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Invite Link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                aria-label="Invite link"
                className="flex-1 rounded-[8px] bg-[#1a1a1a] px-3 py-2 text-[12px] text-gray-300 border border-[var(--panel-divider)] outline-none truncate"
              />
              <button
                onClick={copyLink}
                aria-label="Copy invite link"
                className="flex items-center gap-1.5 rounded-[8px] bg-[var(--blue-button)] px-3 py-2 text-[12px] font-medium text-white hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[var(--blue-border)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
