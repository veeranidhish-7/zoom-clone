export const formatMeetingId = (id: string | null | undefined): string => {
  if (!id) return '';
  const digits = id.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
};

export const formatMeetingTime = (dateStr: string | Date): string => {
  let validDateStr = dateStr;
  if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && dateStr.includes('T')) {
    // If there's no timezone info (Z or +00:00), append Z
    if (!dateStr.match(/(Z|[+-]\d{2}:\d{2})$/)) {
      validDateStr = `${dateStr}Z`;
    }
  }
  const date = new Date(validDateStr);
  const now = new Date();
  
  const isToday = 
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isToday) {
    return `Today, ${timeString}`;
  }

  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return `${dateString}, ${timeString}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

export const parseMeetingCode = (input: string): string | null => {
  const match = input.match(/(\d[\s\-]?){10,11}/);
  if (!match) return null;
  const digits = match[0].replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 11) {
    return digits;
  }
  return null;
};
