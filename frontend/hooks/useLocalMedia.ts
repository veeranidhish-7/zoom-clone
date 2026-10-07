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

  // Keep stream in a ref so it survives renders without being a dep.
  const streamRef = useRef<MediaStream | null>(null);

  // Stable ref for onError so fetchMedia never needs to re-create.
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; });

  // fetchMedia has NO deps — it reads everything through refs.
  // This prevents the acquisition effect from re-running on every render
  // caused by the 3-second participants poll.
  const fetchMedia = useCallback(async (): Promise<MediaStream | null> => {
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
      const msg =
        err instanceof Error && err.name === 'NotFoundError'
          ? 'No camera or microphone found'
          : 'Camera/microphone permission denied';
      onErrorRef.current?.(msg);
      return null;
    }
  }, []); // intentionally empty — stable for the lifetime of the hook

  // ── Acquire media ONCE per room visit ─────────────────────────────────────
  useEffect(() => {
    if (!requestMedia) {
      setIsMuted(true);
      setIsVideoOff(true);
      return;
    }

    let cancelled = false;

    fetchMedia().then((ms) => {
      if (cancelled) {
        // React StrictMode double-mount: stop the just-acquired tracks and
        // clear the ref so the second mount can re-acquire cleanly.
        ms?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStream(null);
        return;
      }
      if (ms) {
        // Start muted, video on.
        ms.getAudioTracks().forEach((t) => { t.enabled = false; });
        setIsMuted(true);
        setIsVideoOff(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [requestMedia, fetchMedia]); // fetchMedia is stable → runs once

  // ── Stop all tracks only when the room unmounts ───────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // ── Toggles: set track.enabled — never stop/restart a track ──────────────
  const toggleMute = useCallback(async () => {
    let ms = streamRef.current;
    if (!ms) {
      ms = await fetchMedia();
      // New stream: enforce current video state before unmuting
      if (ms && isVideoOff) ms.getVideoTracks().forEach((t) => { t.enabled = false; });
    }
    if (!ms) return isMuted; // permission denied

    const next = !isMuted;
    ms.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setIsMuted(next);
    return next;
  }, [isMuted, isVideoOff, fetchMedia]);

  const toggleVideo = useCallback(async () => {
    let ms = streamRef.current;
    if (!ms) {
      ms = await fetchMedia();
      // New stream: enforce current mute state before showing video
      if (ms && isMuted) ms.getAudioTracks().forEach((t) => { t.enabled = false; });
    }
    if (!ms) return isVideoOff;

    const next = !isVideoOff;
    ms.getVideoTracks().forEach((t) => { t.enabled = !next; });
    setIsVideoOff(next);
    return next;
  }, [isVideoOff, isMuted, fetchMedia]);

  // stopAll is called only when the user explicitly leaves the room.
  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return { stream, isMuted, isVideoOff, permissionDenied, toggleMute, toggleVideo, stopAll };
}
