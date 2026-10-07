'use client';

import React, { useEffect, useState } from 'react';

interface Reaction {
  id: number;
  emoji: string;
}

interface EmojiOverlayProps {
  reactions: Reaction[];
}

export default function EmojiOverlay({ reactions }: EmojiOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      {reactions.map((r) => (
        <FloatingEmoji key={r.id} emoji={r.emoji} />
      ))}
    </div>
  );
}

function FloatingEmoji({ emoji }: { emoji: string }) {
  const [visible, setVisible] = useState(true);
  // Random horizontal position 10–80%
  const left = `${10 + Math.floor(Math.random() * 70)}%`;

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <span
      className="absolute bottom-20 text-4xl animate-[float-up_3s_ease-out_forwards]"
      style={{ left }}
    >
      {emoji}
    </span>
  );
}
