import React from 'react';

interface ToolbarProps {
  onEndClick: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  participantsCount: number;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export default function Toolbar({ onEndClick, onToggleParticipants, onToggleChat, participantsCount, isMuted, isVideoOff, onToggleMute, onToggleVideo }: ToolbarProps) {
  return (
    <div className="flex h-16 w-full items-center justify-between bg-[var(--toolbar-bg)] px-4">
      {/* Left side (Audio / Video) */}
      <div className="flex items-center gap-1">
        <div className="flex group">
          <button 
            onClick={onToggleMute}
            className="flex flex-col items-center justify-center rounded p-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition"
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1 text-[var(--muted-red)]">
                <path d="M13.879 10.414a2.501 2.501 0 0 0-3.465 3.465zm.707.707-3.465 3.465a2.501 2.501 0 0 0 3.465-3.465m-4.56-1.096L8.45 8.45A3.5 3.5 0 0 0 5 5V2.5a.5.5 0 0 0-1 0V5a4.5 4.5 0 0 1 8.01 2.76zM7 4a1 1 0 0 1 2 0v4.293l-2-2zM2.854 2.146a.5.5 0 1 0-.708.708l11 11a.5.5 0 0 0 .708-.708z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
              </svg>
            )}
            <span className="text-[10px]">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button className="flex items-center justify-center rounded-r px-1 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </button>
        </div>
        
        <div className="flex group">
          <button 
            onClick={onToggleVideo}
            className="flex flex-col items-center justify-center rounded p-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition"
          >
            {isVideoOff ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1 text-[var(--muted-red)]">
                <path fillRule="evenodd" d="M10.961 12.365a1.5 1.5 0 0 0 2.224-1.182V10.72l-1.99-1.99a1.5 1.5 0 0 1-1.401 1.764l-2.064-2.064a1.5 1.5 0 0 0 .524-1.282L4.08 2.973A1.5 1.5 0 0 0 2 4.015v7.97A1.5 1.5 0 0 0 3.5 13.5h7.461zm-8.814-11a.5.5 0 1 0-.707.707l12.5 12.5a.5.5 0 1 0 .707-.707l-12.5-12.5z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
                <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
              </svg>
            )}
            <span className="text-[10px]">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>
          <button className="flex items-center justify-center rounded-r px-1 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Center items */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleParticipants}
          className="flex flex-col items-center justify-center rounded px-3 py-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
            <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
          </svg>
          <span className="absolute top-1 right-2 bg-[#222] text-[10px] rounded px-1">{participantsCount}</span>
          <span className="text-[10px]">Participants</span>
        </button>
        <button 
          onClick={onToggleChat}
          className="flex flex-col items-center justify-center rounded px-3 py-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
            <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11.586l2.707 2.707A.5.5 0 0 0 17 16V4a2 2 0 0 0-2-2H2zm13 2v9.586l-1.586-1.586H2V4h13z"/>
          </svg>
          <span className="text-[10px]">Chat</span>
        </button>
        <button className="flex flex-col items-center justify-center rounded px-3 py-2 text-[var(--promo-green)] hover:bg-[#1a1a1a] hover:text-[#4ade80] transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
            <path fillRule="evenodd" d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6A.5.5 0 0 1 8 2z"/>
            <path d="M2 14v-2h12v2H2z"/>
          </svg>
          <span className="text-[10px]">Share</span>
        </button>
        <button className="flex flex-col items-center justify-center rounded px-3 py-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
          </svg>
          <span className="text-[10px]">Reactions</span>
        </button>
        <button className="flex flex-col items-center justify-center rounded px-3 py-2 text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mb-1">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
          <span className="text-[10px]">More</span>
        </button>
      </div>

      {/* Right side */}
      <div>
        <button 
          onClick={onEndClick}
          className="rounded-[8px] bg-[var(--end-red)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition shadow-sm"
        >
          End
        </button>
      </div>
    </div>
  );
}
