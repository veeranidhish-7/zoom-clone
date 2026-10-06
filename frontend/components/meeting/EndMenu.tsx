import React from 'react';

interface EndMenuProps {
  isHost: boolean;
  onEndAll: () => void;
  onLeave: () => void;
}

export default function EndMenu({ isHost, onEndAll, onLeave }: EndMenuProps) {
  return (
    <div className="absolute bottom-20 right-4 z-50 w-64 rounded-[8px] bg-[var(--panel-bg)] p-2 shadow-xl border border-[var(--panel-divider)]">
      {isHost ? (
        <div className="flex flex-col gap-1">
          <button 
            onClick={onEndAll}
            className="rounded-[4px] px-4 py-2 text-left text-sm font-medium text-[var(--end-red)] hover:bg-[#2a2a2a] transition"
          >
            End Meeting for All
          </button>
          <button 
            onClick={onLeave}
            className="rounded-[4px] px-4 py-2 text-left text-sm font-medium text-white hover:bg-[#2a2a2a] transition"
          >
            Leave Meeting
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <button 
            onClick={onLeave}
            className="rounded-[4px] px-4 py-2 text-left text-sm font-medium text-[var(--end-red)] hover:bg-[#2a2a2a] transition"
          >
            Leave Meeting
          </button>
        </div>
      )}
    </div>
  );
}
