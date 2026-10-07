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
  const [isReady, setIsReady] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const isMutedRef = useRef(true);
  const isVideoOffRef = useRef(!requestMedia);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isVideoOffRef.current = isVideoOff; }, [isVideoOff]);

  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; });

  const acquireStream = useCallback(async (): Promise<MediaStream | null> => {
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    acquireStream().then((ms) => {
      if (cancelled) {
        ms?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStream(null);
        return;
      }
      if (ms) {
        ms.getAudioTracks().forEach((t) => { t.enabled = false; });
        ms.getVideoTracks().forEach((t) => { t.enabled = requestMedia; });
        setIsMuted(true);
        isMutedRef.current = true;
        setIsVideoOff(!requestMedia);
        isVideoOffRef.current = !requestMedia;
      }
      setIsReady(true);
    });

    return () => { cancelled = true; };
  }, [acquireStream, requestMedia]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const toggleMute = useCallback(async () => {
    const ms = streamRef.current;
    if (!ms) return isMutedRef.current;

    const audioTrack = ms.getAudioTracks()[0];
    const isCurrentlyEnabled = audioTrack ? audioTrack.enabled : false;
    const nextMuted = isCurrentlyEnabled;

    ms.getAudioTracks().forEach((t) => { t.enabled = !nextMuted; });
    setIsMuted(nextMuted);
    return nextMuted;
  }, []);

  const toggleVideo = useCallback(async () => {
    const ms = streamRef.current;
    if (!ms) return isVideoOffRef.current;

    const videoTrack = ms.getVideoTracks()[0];
    const isCurrentlyEnabled = videoTrack ? videoTrack.enabled : false;
    const nextVideoOff = isCurrentlyEnabled;

    ms.getVideoTracks().forEach((t) => { t.enabled = !nextVideoOff; });
    setIsVideoOff(nextVideoOff);
    return nextVideoOff;
  }, []);

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return {
    stream,
    isMuted,
    isVideoOff,
    permissionDenied,
    isReady,
    toggleMute,
    toggleVideo,
    stopAll,
  };
}
