'use client';

import { useState, useRef, useCallback } from 'react';

interface UseScreenShareOptions {
  onError?: (msg: string) => void;
}

export function useScreenShare({ onError }: UseScreenShareOptions = {}) {
  const [shareStream, setShareStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startShare = useCallback(async () => {
    if (streamRef.current) return; // already sharing
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      streamRef.current = stream;
      setShareStream(stream);
      setIsSharing(true);
      // Auto-stop when the user clicks browser's native "Stop sharing"
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        streamRef.current = null;
        setShareStream(null);
        setIsSharing(false);
      });
    } catch (err) {
      // User cancelled (NotAllowedError) or something else — never throw
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        onError?.('Could not start screen share');
      }
      // NotAllowedError = user cancelled picker, silently ignore
    }
  }, [onError]);

  const stopShare = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShareStream(null);
    setIsSharing(false);
  }, []);

  return { shareStream, isSharing, startShare, stopShare };
}
