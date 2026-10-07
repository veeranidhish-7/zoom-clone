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
  // Incremented whenever we add/remove video tracks so VideoTile re-binds srcObject.
  const [streamVersion, setStreamVersion] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const isMutedRef = useRef(true);
  const isVideoOffRef = useRef(!requestMedia);

  // Keep refs in sync with state so stable callbacks read current values.
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isVideoOffRef.current = isVideoOff; }, [isVideoOff]);

  // Stable ref for onError — updated each render, never changes identity.
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; });

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Acquire the initial combined audio+video stream.
  // Stable (empty deps): reads everything through refs.
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
  }, []); // stable

  // ── Acquire ONCE per room visit ───────────────────────────────────────────
  useEffect(() => {
    if (!requestMedia) {
      setIsMuted(true);
      setIsVideoOff(true);
      setIsReady(true);
      return;
    }

    let cancelled = false;

    acquireStream().then((ms) => {
      if (cancelled) {
        // StrictMode double-mount: release and clear so second mount re-acquires.
        ms?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStream(null);
        return;
      }
      if (ms) {
        // Start muted, video on.
        ms.getAudioTracks().forEach((t) => { t.enabled = false; });
        setIsMuted(true);
        isMutedRef.current = true;
        setIsVideoOff(false);
        isVideoOffRef.current = false;
      }
      setIsReady(true);
    });

    return () => { cancelled = true; };
  }, [requestMedia, acquireStream]); // acquireStream is stable → runs once

  // ── Stop everything when the room unmounts ────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // ── Mic toggle: track.enabled only (light stays on while cam is active) ───
  const toggleMute = useCallback(async () => {
    let ms = streamRef.current;
    if (!ms) {
      ms = await acquireStream();
      if (ms) {
        // New stream: enforce current video state.
        if (isVideoOffRef.current) ms.getVideoTracks().forEach((t) => { t.enabled = false; });
      }
    }
    if (!ms) return isMutedRef.current; // permission denied

    const next = !isMutedRef.current;
    ms.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setIsMuted(next);
    return next;
  }, [acquireStream]);

  // ── Video toggle: stop/release track OFF, re-acquire track ON ────────────
  // This is what turns the browser camera indicator light on and off.
  const toggleVideo = useCallback(async () => {
    const ms = streamRef.current;

    if (!isVideoOffRef.current) {
      // ── Turn camera OFF ──────────────────────────────────────────────────
      // Stop and remove the video track so the OS releases the camera.
      if (ms) {
        ms.getVideoTracks().forEach((t) => {
          t.stop();
          ms.removeTrack(t);
        });
        // Bump version so VideoTile re-calls srcObject = stream (same object,
        // updated track list).
        setStreamVersion((v) => v + 1);
      }
      setIsVideoOff(true);
      isVideoOffRef.current = true;
      return true; // new isVideoOff value

    } else {
      // ── Turn camera ON ───────────────────────────────────────────────────
      // Acquire a fresh video-only track and add it to the existing stream.
      // The audio track is untouched.
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        const [videoTrack] = videoStream.getVideoTracks();

        if (!videoTrack) {
          onErrorRef.current?.('No camera found');
          return isVideoOffRef.current;
        }

        if (ms) {
          ms.addTrack(videoTrack);
          setStreamVersion((v) => v + 1);
        } else {
          // No stream yet (user joined without cam then enabled it) — create one.
          const newMs = await acquireStream();
          if (!newMs) return true; // still off
          // acquireStream already sets streamRef and stream state.
          // Enforce mute state on new audio tracks.
          if (isMutedRef.current) {
            newMs.getAudioTracks().forEach((t) => { t.enabled = false; });
          }
          setStreamVersion((v) => v + 1);
          setIsVideoOff(false);
          isVideoOffRef.current = false;
          return false;
        }

        setIsVideoOff(false);
        isVideoOffRef.current = false;
        return false; // new isVideoOff value

      } catch (err) {
        const msg =
          err instanceof Error && err.name === 'NotFoundError'
            ? 'No camera found'
            : 'Camera permission denied';
        onErrorRef.current?.(msg);
        return isVideoOffRef.current; // unchanged
      }
    }
  }, [acquireStream]);

  // ── stopAll: called only when the user explicitly leaves ──────────────────
  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return {
    stream,
    streamVersion, // pass to VideoTile so it re-binds srcObject on track changes
    isMuted,
    isVideoOff,
    permissionDenied,
    isReady,
    toggleMute,
    toggleVideo,
    stopAll,
  };
}
