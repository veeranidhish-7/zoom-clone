import React from 'react';
import VideoTile from './VideoTile';

interface Participant {
  id: number;
  name: string;
  isHost?: boolean;
  isMe?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

export default function VideoGrid({ participants }: { participants: Participant[] }) {
  const count = participants.length;

  let gridClass = 'grid-cols-1';
  let maxW = 'max-w-5xl';
  if (count === 2) {
    gridClass = 'grid-cols-2';
    maxW = 'max-w-6xl';
  } else if (count >= 3 && count <= 4) {
    gridClass = 'grid-cols-2 grid-rows-2';
    maxW = 'max-w-4xl';
  } else if (count >= 5 && count <= 9) {
    gridClass = 'grid-cols-3 grid-rows-3';
    maxW = 'max-w-5xl';
  }

  return (
    <div className={`mx-auto h-full w-full p-4 ${maxW} flex items-center justify-center`}>
      <div className={`grid w-full gap-4 ${gridClass}`} style={{ aspectRatio: count > 2 ? '16/9' : 'auto' }}>
        {participants.map((p) => (
          <VideoTile key={p.id} participant={p} />
        ))}
      </div>
    </div>
  );
}
