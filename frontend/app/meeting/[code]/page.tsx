'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, leaveMeetingBeacon } from '@/lib/api';
import { useMeetingContext } from '@/hooks/useMeetingContext';
import { useParticipants } from '@/hooks/useParticipants';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useScreenShare } from '@/hooks/useScreenShare';
import { usePeerConnections } from '@/hooks/usePeerConnections';
import { useToast } from '@/components/ui/useToast';
import VideoGrid from '@/components/meeting/VideoGrid';
import Toolbar from '@/components/meeting/Toolbar';
import ParticipantsPanel from '@/components/meeting/ParticipantsPanel';
import ChatPanel from '@/components/meeting/ChatPanel';
import EndMenu from '@/components/meeting/EndMenu';
import InviteDialog from '@/components/meeting/InviteDialog';
import EmojiOverlay from '@/components/meeting/EmojiOverlay';
import type { TileParticipant } from '@/components/meeting/VideoTile';

interface Reaction { id: number; emoji: string; }

function MeetingRoomContent() {
  const { code } = useParams();
  const router = useRouter();
  const meetingCode = (Array.isArray(code) ? code[0] : code) ?? '';
  const { toast: addToast } = useToast();

  const { participant: myParticipant, meeting, camRequested } = useMeetingContext();

  // ── Redirect to join if we have no join context ───────────────────────────
  useEffect(() => {
    if (!myParticipant) {
      router.replace(`/meeting/${meetingCode}/join`);
    }
  }, [myParticipant, meetingCode, router]);

  // ── Local media ───────────────────────────────────────────────────────────
  const {
    stream,
    streamVersion,
    isMuted,
    isVideoOff,
    isReady: localMediaReady,
    toggleMute,
    toggleVideo,
    stopAll: stopMedia,
  } = useLocalMedia({
    requestMedia: camRequested,
    onError: (msg) => addToast(msg, 'error'),
  });

  // ── Screen share ──────────────────────────────────────────────────────────
  const { shareStream, isSharing, startShare, stopShare } = useScreenShare({
    onError: (msg) => addToast(msg, 'error'),
  });

  // ── WebRTC peer connections ───────────────────────────────────────────────
  const { remoteStreams, closeAll: closePeers } = usePeerConnections({
    meetingCode,
    participantId: myParticipant?.id ?? null,
    localStream: stream,
    localMediaReady,
    enabled: !!myParticipant?.id,
    onError: (msg) => addToast(msg, 'error'),
  });

  // ── Room state ────────────────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<'participants' | 'chat' | null>(null);
  const [showEndMenu, setShowEndMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [timer, setTimer] = useState(0);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // Sync backend mute/video state optimistically
  const [myIsMuted, setMyIsMuted] = useState(myParticipant?.is_muted ?? true);
  const [myIsVideoOff, setMyIsVideoOff] = useState(myParticipant?.is_video_off ?? true);

  useEffect(() => { setMyIsMuted(isMuted); }, [isMuted]);
  useEffect(() => { setMyIsVideoOff(isVideoOff); }, [isVideoOff]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt+A → toggle mute
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleToggleMute();
        return;
      }
      // Alt+V → toggle video
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handleToggleVideo();
        return;
      }
      // Esc → close dialogs / menus
      if (e.key === 'Escape') {
        setShowEndMenu(false);
        setShowInvite(false);
        // panels stay open (they have their own close buttons)
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally stable — uses refs via handlers below

  // ── Callbacks for participant events ──────────────────────────────────────
  const handleRemoved = useCallback(() => {
    stopMedia();
    stopShare();
    closePeers();
    router.push(`/meeting/${meetingCode}/ended?reason=${encodeURIComponent('You were removed by the host')}`);
  }, [stopMedia, stopShare, closePeers, router, meetingCode]);

  const handleMeetingEnded = useCallback(() => {
    stopMedia();
    stopShare();
    closePeers();
    router.push(`/meeting/${meetingCode}/ended?reason=${encodeURIComponent('The host ended this meeting')}`);
  }, [stopMedia, stopShare, closePeers, router, meetingCode]);

  // ── Participants polling ──────────────────────────────────────────────────
  const backendParticipants = useParticipants({
    code: meetingCode,
    myId: myParticipant?.id ?? null,
    onRemoved: handleRemoved,
    onMeetingEnded: handleMeetingEnded,
    onError: (msg) => addToast(msg, 'error'),
  });

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Tab close → beacon ───────────────────────────────────────────────────
  useEffect(() => {
    const pid = myParticipant?.id;
    if (!pid) return;
    const handler = () => leaveMeetingBeacon(meetingCode, pid);
    window.addEventListener('pagehide', handler);
    return () => window.removeEventListener('pagehide', handler);
  }, [meetingCode, myParticipant?.id]);

  // ── Mic / Video toggles ───────────────────────────────────────────────────
  const handleToggleMute = useCallback(async () => {
    const next = await toggleMute();
    if (!myParticipant?.id) return;
    const prev = myIsMuted;
    setMyIsMuted(next);
    try {
      await api.updateParticipant(meetingCode, myParticipant.id, { is_muted: next });
    } catch {
      setMyIsMuted(prev);
      addToast('Failed to update mute state', 'error');
    }
  }, [toggleMute, myParticipant?.id, myIsMuted, meetingCode, addToast]);

  const handleToggleVideo = useCallback(async () => {
    const next = await toggleVideo();
    if (!myParticipant?.id) return;
    const prev = myIsVideoOff;
    setMyIsVideoOff(next);
    try {
      await api.updateParticipant(meetingCode, myParticipant.id, { is_video_off: next });
    } catch {
      setMyIsVideoOff(prev);
      addToast('Failed to update video state', 'error');
    }
  }, [toggleVideo, myParticipant?.id, myIsVideoOff, meetingCode, addToast]);

  // ── Leave / End ───────────────────────────────────────────────────────────
  const handleLeave = useCallback(async () => {
    if (!myParticipant?.id) return;
    closePeers();
    stopMedia();
    stopShare();
    try {
      await api.leaveMeeting(meetingCode, { participant_id: myParticipant.id });
    } catch (err) {
      if (!(err instanceof ApiError)) {
        addToast('Failed to leave meeting', 'error');
      }
    }
    router.push(`/meeting/${meetingCode}/ended?reason=${encodeURIComponent('You left the meeting')}`);
  }, [myParticipant?.id, meetingCode, closePeers, stopMedia, stopShare, router, addToast]);

  const handleEndAll = useCallback(async () => {
    if (!myParticipant?.id) return;
    closePeers();
    stopMedia();
    stopShare();
    try {
      await api.leaveMeeting(meetingCode, { participant_id: myParticipant.id });
    } catch (err) {
      if (!(err instanceof ApiError)) {
        addToast('Failed to end meeting', 'error');
      }
    }
    router.push(`/meeting/${meetingCode}/ended?reason=${encodeURIComponent('You ended the meeting')}`);
  }, [myParticipant?.id, meetingCode, closePeers, stopMedia, stopShare, router, addToast]);

  // ── Reactions ─────────────────────────────────────────────────────────────
  const handleReaction = useCallback((emoji: string) => {
    const id = Date.now();
    setReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 3200);
  }, []);

  // ── More menu ─────────────────────────────────────────────────────────────
  const handleMoreItem = useCallback((label: string) => {
    addToast(`"${label}" is not available in this demo`, 'info');
  }, [addToast]);

  // ── Build tile list ───────────────────────────────────────────────────────
  const isHost = myParticipant?.role === 'host';

  const meTile: TileParticipant | null = myParticipant
    ? {
        id: myParticipant.id,
        name: myParticipant.display_name,
        isHost,
        isMe: true,
        isMuted: myIsMuted,
        isVideoOff: myIsVideoOff,
        stream: isSharing ? shareStream : stream,
        streamVersion,
        videoMuted: true,   // always mute local tile to avoid echo
      }
    : null;

  const otherTiles: TileParticipant[] = backendParticipants
    .filter((p) => p.id !== myParticipant?.id)
    .map((p) => ({
      id: p.id,
      name: p.display_name,
      isHost: p.role === 'host',
      isMe: false,
      isMuted: p.is_muted,
      isVideoOff: p.is_video_off,
      stream: remoteStreams.get(p.id) ?? null,
      videoMuted: false,    // remote audio plays through
    }));

  const allTiles: TileParticipant[] = meTile ? [meTile, ...otherTiles] : otherTiles;

  const panelParticipants = allTiles.map((t) => ({
    id: t.id,
    display_name: t.name,
    role: (t.isHost ? 'host' : 'participant') as 'host' | 'participant',
    is_muted: t.isMuted,
    is_video_off: t.isVideoOff,
  }));

  if (!myParticipant) return null;

  return (
    <div className="flex h-screen w-screen flex-col bg-[var(--stage-bg)] font-[var(--font-body)] text-white overflow-hidden">
      {/* Invite Dialog */}
      {showInvite && (
        <InviteDialog meetingCode={meetingCode} onClose={() => setShowInvite(false)} />
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 rounded bg-black/40 px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
          <svg className="text-green-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
            <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
          </svg>
          <span className="text-[12px] font-medium">{meeting?.title || 'Meeting'}</span>
          <span className="text-[12px] text-gray-400 ml-2">{formatTimer(timer)}</span>
        </div>
        {/* Screen share banner */}
        {isSharing && (
          <div className="pointer-events-auto flex items-center gap-2 rounded bg-[var(--promo-green)]/20 border border-[var(--promo-green)]/50 px-3 py-1.5 backdrop-blur-sm text-[var(--promo-green)] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--promo-green)] animate-pulse inline-block" />
            You are sharing your screen
            <button
              onClick={stopShare}
              aria-label="Stop sharing screen"
              className="ml-2 rounded bg-[var(--end-red)] px-2 py-0.5 text-white text-[11px] hover:opacity-90 transition"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Stage with emoji overlay on the first (Me) tile */}
        <div className="flex-1 transition-all duration-300 relative">
          <VideoGrid participants={allTiles} />
          {/* Floating emoji reactions — positioned over the local tile area */}
          <EmojiOverlay reactions={reactions} />
        </div>

        {/* Side Panels */}
        {activePanel === 'participants' && (
          <ParticipantsPanel
            participants={panelParticipants}
            myId={myParticipant.id}
            isHost={isHost}
            code={meetingCode}
            onClose={() => setActivePanel(null)}
            onInvite={() => { setShowInvite(true); }}
          />
        )}
        {activePanel === 'chat' && (
          <ChatPanel
            onClose={() => setActivePanel(null)}
            participants={panelParticipants
              .filter((p) => p.id !== myParticipant.id)
              .map((p) => ({ id: p.id, name: p.display_name }))}
          />
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="relative">
        <Toolbar
          participantsCount={allTiles.length}
          isMuted={myIsMuted}
          isVideoOff={myIsVideoOff}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleParticipants={() => setActivePanel((p) => (p === 'participants' ? null : 'participants'))}
          onToggleChat={() => setActivePanel((p) => (p === 'chat' ? null : 'chat'))}
          onEndClick={() => setShowEndMenu(!showEndMenu)}
          onInvite={() => setShowInvite(true)}
          onShare={startShare}
          isSharing={isSharing}
          onStopShare={stopShare}
          onReaction={handleReaction}
          onMoreItem={handleMoreItem}
        />
        {showEndMenu && (
          <EndMenu
            isHost={isHost}
            onEndAll={handleEndAll}
            onLeave={handleLeave}
          />
        )}
      </div>
    </div>
  );
}

export default function MeetingRoom() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#0D0D0D]" />}>
      <MeetingRoomContent />
    </Suspense>
  );
}
