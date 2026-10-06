const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}/api${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // error handled
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Fire-and-forget leave call for pagehide / beforeunload.
 * Uses sendBeacon if available, otherwise fetch with keepalive.
 */
export function leaveMeetingBeacon(code: string, participantId: number) {
  const url = `${API_URL}/api/meetings/${code}/leave`;
  const body = JSON.stringify({ participant_id: participantId });
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export const api = {
  getMe: () => fetchApi('/me'),
  createInstantMeeting: (data?: { title?: string }) => fetchApi('/meetings/instant', { method: 'POST', body: JSON.stringify(data || {}) }),
  createMeeting: (data: { title: string; description?: string; scheduled_start: string; duration_min: number }) => fetchApi('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  getUpcomingMeetings: () => fetchApi('/meetings/upcoming'),
  getRecentMeetings: () => fetchApi('/meetings/recent'),
  getMeeting: (code: string) => fetchApi(`/meetings/${code}`),
  updateMeeting: (code: string, data: Record<string, unknown>) => fetchApi(`/meetings/${code}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMeeting: (code: string) => fetchApi(`/meetings/${code}`, { method: 'DELETE' }),
  joinMeeting: (code: string, data: { display_name: string }) => fetchApi(`/meetings/${code}/join`, { method: 'POST', body: JSON.stringify(data) }),
  leaveMeeting: (code: string, data: { participant_id: number }) => fetchApi(`/meetings/${code}/leave`, { method: 'POST', body: JSON.stringify(data) }),
  getParticipants: (code: string) => fetchApi(`/meetings/${code}/participants`),
  updateParticipant: (code: string, id: number, data: { is_muted?: boolean; is_video_off?: boolean }) => fetchApi(`/meetings/${code}/participants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  muteAll: (code: string, participantId: number) => fetchApi(`/meetings/${code}/mute-all`, { method: 'POST', headers: { 'X-Participant-Id': String(participantId) } }),
  removeParticipant: (code: string, id: number, participantId: number) => fetchApi(`/meetings/${code}/participants/${id}`, { method: 'DELETE', headers: { 'X-Participant-Id': String(participantId) } }),
};
