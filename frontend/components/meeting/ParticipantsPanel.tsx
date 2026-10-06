'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface Participant {
  id: number;
  display_name: string;
  role: 'host' | 'participant';
  is_muted: boolean;
  is_video_off: boolean;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  myId: number | null;
  isHost: boolean;
  code: string;
  onClose: () => void;
}

function Initials({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--avatar-purple)] text-xs font-medium">
      {initials}
    </div>
  );
}

export default function ParticipantsPanel({
  participants,
  myId,
  isHost,
  code,
  onClose,
}: ParticipantsPanelProps) {
  const { addToast } = useToast();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isMutingAll, setIsMutingAll] = useState(false);

  const handleMuteAll = async () => {
    if (!myId || isMutingAll) return;
    setIsMutingAll(true);
    try {
      await api.muteAll(code, myId);
    } catch {
      addToast('Failed to mute all participants', 'error');
    } finally {
      setIsMutingAll(false);
    }
  };

  const handleRemove = async (targetId: number) => {
    if (!myId || removingId !== null) return;
    setRemovingId(targetId);
    try {
      await api.removeParticipant(code, targetId, myId);
    } catch {
      addToast('Failed to remove participant', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex h-full w-[320px] flex-col bg-[var(--panel-bg)] text-white border-l border-[var(--panel-divider)] animate-in slide-in-from-right-full duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--panel-divider)]">
        <h2 className="text-[14px] font-medium">Participants ({participants.length})</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {participants.map((p) => {
          const isMe = p.id === myId;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 hover:bg-[#2a2a2a] rounded group transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Initials name={p.display_name} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium leading-tight text-gray-200 truncate max-w-[140px]">
                    {p.display_name}
                    {isMe && <span className="text-gray-400 ml-1">(Me)</span>}
                    {p.role === 'host' && <span className="text-gray-400 ml-1">(Host)</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Media status icons */}
                <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100">
                  {p.is_muted ? (
                    <svg className="text-[var(--muted-red)]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465m-4.56-1.096L8.45 8.45A3.5 3.5 0 0 0 5 5V2.5a.5.5 0 0 0-1 0V5a4.5 4.5 0 0 1 8.01 2.76zM7 4a1 1 0 0 1 2 0v4.293l-2-2zM2.854 2.146a.5.5 0 1 0-.708.708l11 11a.5.5 0 0 0 .708-.708z"/>
                    </svg>
                  ) : (
                    <svg className="text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
                      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                  )}
                  {p.is_video_off ? (
                    <svg className="text-[var(--muted-red)]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10.961 12.365a1.5 1.5 0 0 0 2.224-1.182V10.72l-1.99-1.99a1.5 1.5 0 0 1-1.401 1.764l-2.064-2.064a1.5 1.5 0 0 0 .524-1.282L4.08 2.973A1.5 1.5 0 0 0 2 4.015v7.97A1.5 1.5 0 0 0 3.5 13.5h7.461zm-8.814-11a.5.5 0 1 0-.707.707l12.5 12.5a.5.5 0 1 0 .707-.707l-12.5-12.5z"/>
                    </svg>
                  ) : (
                    <svg className="text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
                    </svg>
                  )}
                </div>

                {/* Host-only: Remove button (not for self or other hosts) */}
                {isHost && !isMe && p.role !== 'host' && (
                  <button
                    onClick={() => handleRemove(p.id)}
                    disabled={removingId === p.id}
                    title="Remove participant"
                    className="hidden group-hover:flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] text-red-400 hover:bg-red-900/30 transition disabled:opacity-50"
                  >
                    {removingId === p.id ? '…' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--panel-divider)] flex gap-2 justify-between">
        <button className="flex-1 rounded-[8px] bg-[#333] py-1.5 text-xs font-medium hover:bg-[#444] transition">
          Invite
        </button>
        {isHost && (
          <button
            onClick={handleMuteAll}
            disabled={isMutingAll}
            className="flex-1 rounded-[8px] bg-[#333] py-1.5 text-xs font-medium hover:bg-[#444] transition disabled:opacity-50"
          >
            {isMutingAll ? 'Muting…' : 'Mute All'}
          </button>
        )}
        <button className="rounded-[8px] bg-[#333] px-3 py-1.5 text-xs font-medium hover:bg-[#444] transition">
          More
        </button>
      </div>
    </div>
  );
}
