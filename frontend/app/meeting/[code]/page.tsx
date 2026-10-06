'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MeetingRoom() {
  const { code } = useParams();
  const router = useRouter();

  return (
    <div className="h-screen w-screen bg-[#0D0D0D] text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Meeting Room: {code}</h1>
          <p className="text-gray-400">The meeting room UI will be implemented here.</p>
        </div>
      </div>
      <div className="h-16 bg-[#080808] border-t border-[#2A2B2D] flex items-center justify-center gap-4">
        <button 
          onClick={() => router.push(`/meeting/${code}/ended`)} 
          className="bg-[#FF0055] px-6 py-2 rounded text-sm font-medium hover:opacity-90 transition"
        >
          End Meeting
        </button>
      </div>
    </div>
  );
}
