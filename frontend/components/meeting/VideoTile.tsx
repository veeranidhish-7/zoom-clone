'use client';

import React, { useRef, useEffect } from 'react';

export interface TileParticipant {
  id: number;
  name: string;
  isHost?: boolean;
  isMe?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream | null;       // only for "Me" tile
  streamVersion?: number;            // bumped when tracks are added/removed
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
}

export default function VideoTile({ participant }: { participant: TileParticipant }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Re-bind srcObject whenever the stream object changes OR whenever tracks
  // are added/removed in-place (signalled by streamVersion).
  // The <video> is always in the DOM so srcObject survives grid layout changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = participant.stream ?? null;
    // Always reassign when version ticks — even if the object reference is the
    // same — so the browser picks up the updated track list.
    video.srcObject = next;
    if (next) {
      video.play().catch(() => {
        // Swallow: muted autoplay is almost never blocked, but just in case.
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participant.stream, participant.streamVersion]);

  const showVideo = participant.isMe
    ? !!participant.stream && !participant.isVideoOff
    : !participant.isVideoOff;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[12px] bg-[var(--camoff-tile)] flex items-center justify-center border border-transparent hover:border-[#444] transition-colors">

      {/* Always rendered — hidden via opacity so srcObject is never lost */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transform: participant.isMe ? 'scaleX(-1)' : undefined }}
      />

      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--camoff-tile)] z-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--avatar-purple)] text-3xl font-medium text-white shadow-lg">
            {getInitials(participant.name)}
          </div>
        </div>
      )}

      {/* Name label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded bg-black/70 px-3 py-1.5 text-xs text-white z-20 shadow-sm backdrop-blur-sm">
        {participant.isMuted && (
          <svg className="text-[var(--muted-red)] shrink-0" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465m-4.56-1.096L8.45 8.45A3.5 3.5 0 0 0 5 5V2.5a.5.5 0 0 0-1 0V5a4.5 4.5 0 0 1 8.01 2.76zM7 4a1 1 0 0 1 2 0v4.293l-2-2zM2.854 2.146a.5.5 0 1 0-.708.708l11 11a.5.5 0 0 0 .708-.708z"/>
          </svg>
        )}
        <span className="font-medium truncate max-w-[120px]">
          {participant.name}{participant.isMe ? ' (Me)' : ''}{participant.isHost ? ' (Host)' : ''}
        </span>
      </div>
    </div>
  );
}
