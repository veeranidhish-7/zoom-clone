'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import VideoGrid from '@/components/meeting/VideoGrid';
import Toolbar from '@/components/meeting/Toolbar';
import ParticipantsPanel from '@/components/meeting/ParticipantsPanel';
import ChatPanel from '@/components/meeting/ChatPanel';
import EndMenu from '@/components/meeting/EndMenu';

function MeetingRoomContent() {
  const { code } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const myName = searchParams.get('name') || 'Anirudh';
  const camOn = searchParams.get('cam') === 'true';

  const [activePanel, setActivePanel] = useState<'participants' | 'chat' | null>(null);
  const [showEndMenu, setShowEndMenu] = useState(false);
  const [timer, setTimer] = useState(0);

  const [meetingData, setMeetingData] = useState<{ title: string } | null>(null);
  const [myParticipantId, setMyParticipantId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(!camOn);

  // Mock participants (but replace 'Me' with real state)
  const participants = [
    { id: 1, name: myName, isHost: true, isMe: true, isMuted: isMuted, isVideoOff: isVideoOff },
    { id: 2, name: 'Priya Sharma', isMuted: false, isVideoOff: true },
    { id: 3, name: 'Rahul Verma', isMuted: true, isVideoOff: false },
    { id: 4, name: 'Sneha Iyer', isMuted: true, isVideoOff: true },
  ];

  useEffect(() => {
    let isMounted = true;
    async function join() {
      try {
        const meetingCode = (Array.isArray(code) ? code[0] : code) || '';
        const res = await api.joinMeeting(meetingCode, { display_name: myName }) as { meeting: { title: string }, participant: { id: number } };
        if (isMounted) {
          setMeetingData(res.meeting);
          setMyParticipantId(res.participant.id);
        }
      } catch (err) {
        console.error('Failed to join', err);
      }
    }
    join();
    return () => { isMounted = false; };
  }, [code, myName]);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleMute = async () => {
    setIsMuted(!isMuted);
    if (myParticipantId) {
      const meetingCode = (Array.isArray(code) ? code[0] : code) || '';
      try { await api.updateParticipant(meetingCode, myParticipantId, { is_muted: !isMuted }); } catch (e) {}
    }
  };

  const handleToggleVideo = async () => {
    setIsVideoOff(!isVideoOff);
    if (myParticipantId) {
      const meetingCode = (Array.isArray(code) ? code[0] : code) || '';
      try { await api.updateParticipant(meetingCode, myParticipantId, { is_video_off: !isVideoOff }); } catch (e) {}
    }
  };

  const handleEnd = async () => {
    const meetingCode = (Array.isArray(code) ? code[0] : code) || '';
    if (myParticipantId) {
      try {
        await api.leaveMeeting(meetingCode, { participant_id: myParticipantId });
      } catch (err) {
        console.error('Failed to leave', err);
      }
    }
    router.push(`/meeting/${meetingCode}/ended`);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[var(--stage-bg)] font-[var(--font-body)] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 rounded bg-black/40 px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
          <svg className="text-green-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
            <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
          </svg>
          <span className="text-[12px] font-medium">{meetingData?.title || 'My Meeting'}</span>
          <span className="text-[12px] text-gray-400 ml-2">{formatTimer(timer)}</span>
        </div>
        <div className="pointer-events-auto">
          <button className="rounded bg-black/40 px-3 py-1.5 backdrop-blur-sm text-[12px] font-medium flex items-center gap-2 hover:bg-black/60 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2zm1 0v12h8V2H4z"/>
            </svg>
            View
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Stage */}
        <div className="flex-1 transition-all duration-300">
          <VideoGrid participants={participants} />
        </div>

        {/* Side Panels */}
        {activePanel === 'participants' && (
          <ParticipantsPanel 
            participants={participants} 
            onClose={() => setActivePanel(null)} 
          />
        )}
        {activePanel === 'chat' && (
          <ChatPanel onClose={() => setActivePanel(null)} participants={participants.filter(p => !p.isMe)} />
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="relative">
        <Toolbar 
          participantsCount={participants.length}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleParticipants={() => setActivePanel(p => p === 'participants' ? null : 'participants')}
          onToggleChat={() => setActivePanel(p => p === 'chat' ? null : 'chat')}
          onEndClick={() => setShowEndMenu(!showEndMenu)}
        />
        {showEndMenu && (
          <EndMenu 
            isHost={participants[0]?.isHost || false}
            onEndAll={handleEnd}
            onLeave={handleEnd}
          />
        )}
      </div>
    </div>
  );
}

export default function MeetingRoom() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#0D0D0D]"></div>}>
      <MeetingRoomContent />
    </Suspense>
  );
}
