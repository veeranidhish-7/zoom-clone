"use client";

import { useState, useEffect } from "react";

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="flex flex-col items-center justify-center py-8 opacity-0">
        <h1 className="text-[40px] font-medium text-[var(--text-heading)] tracking-tight mb-1">00:00 PM</h1>
        <p className="text-[var(--text-muted)] text-[15px]">Loading...</p>
      </div>
    );
  }

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h1 className="text-[40px] font-semibold text-[var(--text-heading)] tracking-tight mb-1">
        {timeString}
      </h1>
      <p className="text-[var(--text-muted)] text-[15px]">{dateString}</p>
    </div>
  );
}
