'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FormRow, TextInput, SelectInput } from '@/components/ui/FormUI';

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
    <div className="w-full text-sm">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col">
        {errors.api && <div className="text-red-500 mb-4">{errors.api}</div>}
        
        <FormRow label="Topic" required error={errors.topic}>
          <TextInput 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </FormRow>

        <FormRow label="Description">
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[var(--divider)] hover:border-gray-400 focus:border-[var(--blue-button)] focus:ring-1 focus:ring-[var(--blue-button)] rounded-lg px-3 py-2.5 h-24 text-sm outline-none transition-colors resize-y"
            placeholder="Add description"
          />
        </FormRow>

        <FormRow label="When" error={errors.start}>
          <div className="flex gap-4 items-center">
            <div className="relative w-48">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[var(--divider)] hover:border-gray-400 focus:border-[var(--blue-button)] focus:ring-1 focus:ring-[var(--blue-button)] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
            <div className="relative w-32">
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-[var(--divider)] hover:border-gray-400 focus:border-[var(--blue-button)] focus:ring-1 focus:ring-[var(--blue-button)] rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>
        </FormRow>

        <FormRow label="Duration" error={errors.duration}>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <SelectInput value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-20">
                {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(h => <option key={h} value={h}>{h}</option>)}
              </SelectInput>
              <span className="text-[var(--text-body)]">hr</span>
            </div>
            
            <div className="flex items-center gap-2">
              <SelectInput value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-20">
                {[0,15,30,40,45].sort((a,b) => a-b).map(m => <option key={m} value={m}>{m}</option>)}
              </SelectInput>
              <span className="text-[var(--text-body)]">min</span>
            </div>
          </div>
        </FormRow>

        <FormRow label="Time Zone">
          <SelectInput disabled className="w-80 bg-gray-50 text-[var(--text-muted)] cursor-not-allowed">
            <option>{timeZone || 'Loading...'}</option>
          </SelectInput>
        </FormRow>

        <div className="pt-6 mt-6 border-t border-[var(--divider)] flex gap-4 md:pl-[200px]">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[var(--blue-button)] text-white px-8 py-2.5 rounded-full font-medium hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--blue-button)] transition-all disabled:opacity-50 text-sm"
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
            className="bg-transparent text-[var(--blue-button)] border border-transparent px-8 py-2.5 rounded-full font-medium hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-[var(--blue-button)] transition-all disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
