import React from 'react';

interface Participant {
  id: number;
  name: string;
  isHost?: boolean;
  isMe?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

export default function VideoTile({ participant }: { participant: Participant }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[12px] bg-[var(--camoff-tile)] flex items-center justify-center border border-transparent hover:border-[#444] transition-colors">
      {participant.isVideoOff ? (
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--avatar-purple)] text-3xl font-medium text-white shadow-lg">
          {getInitials(participant.name)}
        </div>
      ) : (
        <div className="h-full w-full bg-gray-800 flex items-center justify-center">
          {/* Mock video feed */}
          <span className="text-gray-500">Video Feed</span>
        </div>
      )}

      {/* Name label bottom-left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
        {participant.isMuted && (
          <svg className="text-[var(--muted-red)]" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465m-4.56-1.096L8.45 8.45A3.5 3.5 0 0 0 5 5V2.5a.5.5 0 0 0-1 0V5a4.5 4.5 0 0 1 8.01 2.76zM7 4a1 1 0 0 1 2 0v4.293l-2-2zM2.854 2.146a.5.5 0 1 0-.708.708l11 11a.5.5 0 0 0 .708-.708z"/>
          </svg>
        )}
        <span className="font-medium truncate max-w-[120px]">
          {participant.name}
        </span>
      </div>
    </div>
  );
}
