'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface ScheduleFormProps {
  initialData?: {
    code: string;
    title: string;
    description: string;
    scheduled_start: string;
    duration_min: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const router = useRouter();
  
  // Format initial date/time for inputs
  const initialDateStr = initialData?.scheduled_start 
    ? (initialData.scheduled_start.match(/(Z|[+-]\d{2}:\d{2})$/) ? initialData.scheduled_start : `${initialData.scheduled_start}Z`)
    : '';

  const getLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const defaultDate = initialDateStr 
    ? getLocalDateStr(new Date(initialDateStr))
    : getLocalDateStr(new Date());
    
  const defaultTime = initialDateStr
    ? new Date(initialDateStr).toTimeString().slice(0, 5)
    : '10:00';

  const [topic, setTopic] = useState(initialData?.title || 'My Meeting');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [hours, setHours] = useState(initialData ? Math.floor(initialData.duration_min / 60) : 0);
  const [minutes, setMinutes] = useState(initialData ? initialData.duration_min % 60 : 40);
  const [timeZone, setTimeZone] = useState('');
  
  const [errors, setErrors] = useState<{ topic?: string; start?: string; duration?: string; api?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: any = {};
    if (!topic.trim()) newErrors.topic = 'Topic is required';
    
    const durationMin = hours * 60 + minutes;
    if (durationMin <= 0) newErrors.duration = 'Duration must be greater than 0';
    
    const startDateTime = new Date(`${date}T${time}`);
    if (startDateTime.getTime() < new Date().getTime()) {
      newErrors.start = 'Start time cannot be in the past';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: topic.trim(),
        description: description.trim(),
        scheduled_start: startDateTime.toISOString(),
        duration_min: durationMin,
      };

      if (initialData) {
        await api.updateMeeting(initialData.code, payload);
        setToast('Meeting updated successfully');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push(`/meetings/${initialData.code}`);
        }, 1000);
      } else {
        const res: any = await api.createMeeting(payload);
        setToast('Meeting scheduled successfully');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push(`/meetings/${res.meeting_code}`);
        }, 1000);
      }
    } catch (err: any) {
      setErrors({ api: err.message || 'An error occurred' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl w-full text-sm">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.api && <div className="text-red-500 mb-4">{errors.api}</div>}
        
        {/* Topic */}
        <div className="flex flex-col md:flex-row md:items-start">
          <label className="w-48 pt-2 text-[var(--text-body)] font-medium">Topic</label>
          <div className="flex-1">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-[var(--input-border)] rounded px-3 py-2 focus:outline-none focus:border-[var(--blue-button)]"
            />
            {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col md:flex-row md:items-start">
          <label className="w-48 pt-2 text-[var(--text-body)] font-medium">Description</label>
          <div className="flex-1">
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-[var(--input-border)] rounded px-3 py-2 h-20 focus:outline-none focus:border-[var(--blue-button)]"
            />
          </div>
        </div>

        {/* When */}
        <div className="flex flex-col md:flex-row md:items-start">
          <label className="w-48 pt-2 text-[var(--text-body)] font-medium">When</label>
          <div className="flex-1">
            <div className="flex gap-4 items-center">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-[var(--input-border)] rounded px-3 py-2 focus:outline-none focus:border-[var(--blue-button)]"
              />
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-[var(--input-border)] rounded px-3 py-2 focus:outline-none focus:border-[var(--blue-button)]"
              />
            </div>
            {errors.start && <p className="text-red-500 text-xs mt-1">{errors.start}</p>}
          </div>
        </div>

        {/* Duration */}
        <div className="flex flex-col md:flex-row md:items-center">
          <label className="w-48 text-[var(--text-body)] font-medium">Duration</label>
          <div className="flex-1 flex gap-2 items-center">
            <select 
              value={hours} 
              onChange={(e) => setHours(Number(e.target.value))}
              className="border border-[var(--input-border)] rounded px-3 py-2 bg-white w-24"
            >
              {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="text-[var(--text-body)]">hr</span>
            
            <select 
              value={minutes} 
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="border border-[var(--input-border)] rounded px-3 py-2 bg-white w-24 ml-2"
            >
              {[0,15,30,45, 40].sort((a,b) => a-b).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-[var(--text-body)]">min</span>
          </div>
        </div>
        {errors.duration && (
          <div className="flex flex-col md:flex-row">
            <div className="w-48"></div>
            <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
          </div>
        )}

        {/* Time Zone */}
        <div className="flex flex-col md:flex-row md:items-center">
          <label className="w-48 text-[var(--text-body)] font-medium">Time Zone</label>
          <div className="flex-1">
            <select disabled className="border border-[var(--input-border)] rounded px-3 py-2 bg-gray-50 text-[var(--text-muted)] w-64">
              <option>{timeZone || 'Loading...'}</option>
            </select>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[var(--divider)] flex gap-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[var(--blue-button)] text-white px-6 py-2 rounded font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            Save
          </button>
          <button 
            type="button" 
            onClick={() => {
              if (onCancel) onCancel();
              else router.back();
            }}
            disabled={isSubmitting}
            className="bg-[#F5F5F5] text-[var(--text-body)] border border-[var(--divider)] px-6 py-2 rounded font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
