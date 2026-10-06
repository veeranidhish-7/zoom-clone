'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function PreJoinPage() {
  const { code } = useParams();
  const router = useRouter();
  const [name, setName] = useState('Anirudh'); // Default user
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (withVideo: boolean) => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    try {
      const res: any = await api.joinMeeting(code as string, { display_name: name.trim() });
      
      localStorage.setItem(`participant_${code}`, JSON.stringify(res.participant));
      
      router.push(`/meeting/${code}?video=${withVideo}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join meeting');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center p-4">
      <div className="bg-[#2D2D2D] rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-center">Do you want people to see you in the meeting?</h1>
        <p className="text-gray-400 text-sm mb-8 text-center">You can change this later in the meeting.</p>
        
        {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-gray-600 rounded px-4 py-3 text-white focus:outline-none focus:border-[var(--blue-button)]"
            placeholder="Enter your name"
          />
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => handleJoin(true)}
            disabled={isLoading}
            className="w-full bg-[var(--blue-button)] text-white font-medium py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            Use microphone and camera
          </button>
          <button 
            onClick={() => handleJoin(false)}
            disabled={isLoading}
            className="w-full bg-transparent border border-gray-500 text-gray-300 font-medium py-3 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            Continue without microphone and camera
          </button>
        </div>
      </div>
    </div>
  );
}
