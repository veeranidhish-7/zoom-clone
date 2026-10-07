'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLocalMediaOptions {
  requestMedia: boolean; // true = "Use mic and camera"
  onError?: (msg: string) => void;
}

export function useLocalMedia({ requestMedia, onError }: UseLocalMediaOptions) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(!requestMedia);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchMedia = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = ms;
      setStream(ms);
      return ms;
    } catch (err) {
      setPermissionDenied(true);
      const msg = err instanceof Error && err.name === 'NotFoundError'
        ? 'No camera or microphone found'
        : 'Camera/microphone permission denied';
      onError?.(msg);
      return null;
    }
  }, [onError]);

  // Acquire media on mount if requested
  useEffect(() => {
    if (!requestMedia) {
      setIsMuted(true);
      setIsVideoOff(true);
      return;
    }

    let cancelled = false;
    fetchMedia().then((ms) => {
      if (cancelled) {
        ms?.getTracks().forEach((t) => t.stop());
        return;
      }
      if (ms) {
        setIsMuted(true);
        // Turn off audio track since we start muted
        ms.getAudioTracks().forEach((t) => { t.enabled = false; });
        setIsVideoOff(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [requestMedia, fetchMedia]);

  // Stop all tracks on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMute = useCallback(async () => {
    let currentStream = streamRef.current;
    let newlyFetched = false;
    if (!currentStream) {
       currentStream = await fetchMedia();
       newlyFetched = true;
    }
    if (!currentStream) return isMuted;

    if (newlyFetched && isVideoOff) {
      currentStream.getVideoTracks().forEach((t) => { t.enabled = false; });
    }

    const tracks = currentStream.getAudioTracks() ?? [];
    const next = !isMuted;
    tracks.forEach((t) => { t.enabled = !next; }); 
    setIsMuted(next);
    return next;
  }, [isMuted, fetchMedia, isVideoOff]);

  const toggleVideo = useCallback(async () => {
    let currentStream = streamRef.current;
    let newlyFetched = false;
    if (!currentStream) {
       currentStream = await fetchMedia();
       newlyFetched = true;
    }
    if (!currentStream) return isVideoOff;

    if (newlyFetched && isMuted) {
      currentStream.getAudioTracks().forEach((t) => { t.enabled = false; });
    }

    const tracks = currentStream.getVideoTracks() ?? [];
    const next = !isVideoOff;
    tracks.forEach((t) => { t.enabled = !next; }); 
    setIsVideoOff(next);
    return next;
  }, [isVideoOff, fetchMedia, isMuted]);

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return { stream, isMuted, isVideoOff, permissionDenied, toggleMute, toggleVideo, stopAll };
}
