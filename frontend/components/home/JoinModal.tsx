"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { parseMeetingCode } from "@/lib/format";

interface JoinModalProps {
  onClose: () => void;
}

export function JoinModal({ onClose }: JoinModalProps) {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const me = await api.getMe() as { name?: string };
        if (mounted && me.name) setDisplayName(me.name);
      } catch {
        // error handled
      }
    };
    fetchUser();
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      mounted = false;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsedCode = parseMeetingCode(meetingId);
    
    if (!parsedCode) {
      setError("Invalid Meeting ID or personal link name");
      return;
    }

    setLoading(true);
    try {
      await api.getMeeting(parsedCode);
      router.push(`/meeting/${parsedCode}/join`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Meeting not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--divider)] flex justify-between items-center">
          <h2 className="text-lg font-medium text-[var(--text-heading)]">Join Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-sidebar)]">Meeting ID or Personal Link Name</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID or personal link name"
              className="w-full px-3 py-2 border border-[var(--divider)] rounded-lg focus:outline-none focus:border-[var(--blue-tile)] focus:ring-1 focus:ring-[var(--blue-tile)] text-sm"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-sidebar)]">Your Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-[var(--divider)] rounded-lg focus:outline-none focus:border-[var(--blue-tile)] focus:ring-1 focus:ring-[var(--blue-tile)] text-sm"
            />
          </div>

          {error && <p className="text-sm text-[#FF0055] mt-1">{error}</p>}
          
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--divider)] font-medium text-sm hover:bg-gray-50 text-[var(--text-body)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!meetingId.trim() || loading}
              className="px-6 py-2 rounded-lg bg-[var(--blue-button)] text-white font-medium text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
