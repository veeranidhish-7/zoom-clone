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

  // Acquire media on mount if requested
  useEffect(() => {
    if (!requestMedia) {
      setIsMuted(true);
      setIsVideoOff(true);
      return;
    }

    let cancelled = false;

    async function getMedia() {
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          ms.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = ms;
        setStream(ms);
        // Start muted and cam on by spec
        ms.getAudioTracks().forEach((t) => { t.enabled = false; });
        setIsMuted(true);
        setIsVideoOff(false);
      } catch (err) {
        if (cancelled) return;
        setPermissionDenied(true);
        setIsMuted(true);
        setIsVideoOff(true);
        const msg =
          err instanceof Error && err.name === 'NotFoundError'
            ? 'No camera or microphone found'
            : 'Camera/microphone permission denied';
        onError?.(msg);
      }
    }

    getMedia();

    return () => {
      cancelled = true;
    };
  }, [requestMedia]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop all tracks on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMute = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    const next = !isMuted;
    tracks.forEach((t) => { t.enabled = !next; }); // enabled = true → unmuted
    setIsMuted(next);
    return next;
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    const next = !isVideoOff;
    tracks.forEach((t) => { t.enabled = !next; }); // enabled = true → video on
    setIsVideoOff(next);
    return next;
  }, [isVideoOff]);

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return { stream, isMuted, isVideoOff, permissionDenied, toggleMute, toggleVideo, stopAll };
}
