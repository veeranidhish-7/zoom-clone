'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// ── ICE servers ───────────────────────────────────────────────────────────────
function getIceServers(): RTCIceServer[] {
  try {
    const raw = process.env.NEXT_PUBLIC_ICE_SERVERS;
    if (raw) return JSON.parse(raw) as RTCIceServer[];
  } catch {/* ignore */}
  return [{ urls: 'stun:stun.l.google.com:19302' }];
}

// ── WS URL derivation ────────────────────────────────────────────────────────
function wsUrl(code: string, participantId: number): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const ws = base.replace(/^https/, 'wss').replace(/^http/, 'ws');
  return `${ws}/ws/meetings/${code}?participant_id=${participantId}`;
}

interface Options {
  meetingCode: string;
  participantId: number | null;
  localStream: MediaStream | null;
  localMediaReady: boolean;
  enabled: boolean;
  localMediaState: { video: boolean; audio: boolean };
  onError?: (msg: string) => void;
  onPeerFailed?: (peerId: number) => void;
  onPeerLeft?: (peerId: number) => void;
  onReconnecting?: () => void;
  onReconnectFailed?: () => void;
  onChat?: (msg: { from: number; from_name: string; to: number | null; text: string; ts: string }) => void;
}

type RemoteStreams = Map<number, MediaStream>;

export function usePeerConnections({
  meetingCode,
  participantId,
  localStream,
  localMediaReady,
  enabled,
  localMediaState,
  onError,
  onPeerFailed,
  onPeerLeft,
  onReconnecting,
  onReconnectFailed,
  onChat,
}: Options) {
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>(new Map());
  const [mediaStates, setMediaStates] = useState<Map<number, {video: boolean, audio: boolean}>>(new Map());
  const [connectedPeers, setConnectedPeers] = useState<Set<number>>(new Set());
  const [retryCount, setRetryCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pcsRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const iceCacheRef = useRef<Map<number, RTCIceCandidateInit[]>>(new Map());
  const remoteStreamsRef = useRef<RemoteStreams>(new Map());
  const intentionalCloseRef = useRef(false);

  const localStreamRef = useRef<MediaStream | null>(localStream);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

  const localMediaStateRef = useRef(localMediaState);
  useEffect(() => { localMediaStateRef.current = localMediaState; }, [localMediaState]);

  const onErrorRef = useRef(onError);
  const onPeerFailedRef = useRef(onPeerFailed);
  const onPeerLeftRef = useRef(onPeerLeft);
  const onReconnectingRef = useRef(onReconnecting);
  const onReconnectFailedRef = useRef(onReconnectFailed);
  const onChatRef = useRef(onChat);
  
  useEffect(() => { 
    onErrorRef.current = onError;
    onPeerFailedRef.current = onPeerFailed;
    onPeerLeftRef.current = onPeerLeft;
    onReconnectingRef.current = onReconnecting;
    onReconnectFailedRef.current = onReconnectFailed;
    onChatRef.current = onChat;
  });

  const send = useCallback((msg: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.debug(`[rtc] Sending message: ${JSON.stringify(msg)}`);
      ws.send(JSON.stringify(msg));
    }
  }, []);

  // Broadcast media state when it changes
  useEffect(() => {
    send({ type: 'media-state', video: localMediaState.video, audio: localMediaState.audio });
  }, [localMediaState, send]);

  const updateRemoteStream = useCallback((peerId: number, stream: MediaStream | null) => {
    const next = new Map(remoteStreamsRef.current);
    if (stream) next.set(peerId, stream); else next.delete(peerId);
    remoteStreamsRef.current = next;
    setRemoteStreams(next);
  }, []);

  const closePeer = useCallback((peerId: number) => {
    pcsRef.current.get(peerId)?.close();
    pcsRef.current.delete(peerId);
    iceCacheRef.current.delete(peerId);
    updateRemoteStream(peerId, null);
    setConnectedPeers((prev) => {
      const next = new Set(prev);
      next.delete(peerId);
      return next;
    });
  }, [updateRemoteStream]);

  const createPc = useCallback((peerId: number): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: getIceServers() });
    pcsRef.current.set(peerId, pc);

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        onPeerFailedRef.current?.(peerId);
        closePeer(peerId);
      } else if (pc.connectionState === 'connected') {
        const lms = localMediaStateRef.current;
        send({ type: 'media-state', to: peerId, video: lms.video, audio: lms.audio });
      }
    };

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => {
        pc.addTrack(t, stream);
      });
      if (stream.getVideoTracks().length === 0) {
        pc.addTransceiver('video', { direction: 'sendrecv', streams: [stream] });
      }
      if (stream.getAudioTracks().length === 0) {
        pc.addTransceiver('audio', { direction: 'sendrecv', streams: [stream] });
      }
    } else {
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });
    }

    pc.ontrack = (ev) => {
      let remoteStream = remoteStreamsRef.current.get(peerId);
      if (!remoteStream) {
        remoteStream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream();
      }
      if (!ev.streams || !ev.streams[0]) {
        remoteStream.addTrack(ev.track);
      }
      updateRemoteStream(peerId, remoteStream);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        send({ type: 'ice', to: peerId, candidate: ev.candidate });
      }
    };

    return pc;
  }, [send, updateRemoteStream]);

  const drainIceCache = useCallback(async (peerId: number, pc: RTCPeerConnection) => {
    const queued = iceCacheRef.current.get(peerId) ?? [];
    iceCacheRef.current.delete(peerId);
    for (const c of queued) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore */ }
    }
  }, []);

  const handlePeers = useCallback(async (peers: number[]) => {
    setConnectedPeers((prev) => {
      const next = new Set(prev);
      peers.forEach((p) => next.add(p));
      return next;
    });
    for (const peerId of peers) {
      if (pcsRef.current.has(peerId)) continue;
      const pc = createPc(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send({ type: 'offer', to: peerId, sdp: offer });
      } catch (e) { console.error('offer error', e); }
    }
  }, [createPc, send]);

  const handleOffer = useCallback(async (from: number, sdp: RTCSessionDescriptionInit) => {
    let pc = pcsRef.current.get(from);
    if (!pc) pc = createPc(from);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await drainIceCache(from, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send({ type: 'answer', to: from, sdp: answer });
    } catch (e) { console.error('answer error', e); }
  }, [createPc, drainIceCache, send]);

  const handleAnswer = useCallback(async (from: number, sdp: RTCSessionDescriptionInit) => {
    const pc = pcsRef.current.get(from);
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await drainIceCache(from, pc);
    } catch (e) { console.error('set answer error', e); }
  }, [drainIceCache]);

  const handleIce = useCallback(async (from: number, candidate: RTCIceCandidateInit) => {
    const pc = pcsRef.current.get(from);
    if (!pc || !pc.remoteDescription) {
      const cache = iceCacheRef.current.get(from) ?? [];
      cache.push(candidate);
      iceCacheRef.current.set(from, cache);
      return;
    }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { console.warn('ICE error', e); }
  }, []);

  const handlePeerLeft = useCallback((peerId: number) => {
    closePeer(peerId);
    onPeerLeftRef.current?.(peerId);
  }, [closePeer]);

  useEffect(() => {
    if (!enabled || !participantId || !localMediaReady) return;
    let isActive = true;

    if (wsRef.current) return;

    const ws = new WebSocket(wsUrl(meetingCode, participantId));
    wsRef.current = ws;

    ws.onopen = () => {
      const lms = localMediaStateRef.current;
      send({ type: 'media-state', video: lms.video, audio: lms.audio });
    };

    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
      if (!isActive || intentionalCloseRef.current) return;
      
      if (retryCount < 5) {
        onReconnectingRef.current?.();
        const delay = retryCount === 0 ? 1000 : retryCount === 1 ? 2000 : 4000;
        setTimeout(() => {
          if (isActive && !intentionalCloseRef.current) {
            setRetryCount((c) => c + 1);
          }
        }, delay);
      } else {
        onReconnectFailedRef.current?.();
      }
    };

    ws.onmessage = (ev) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(ev.data as string); } catch { return; }
      const type = msg.type as string;
      if (type === 'peers')       handlePeers((msg.peers as number[]) ?? []);
      else if (type === 'offer')  handleOffer(msg.from as number, msg.sdp as RTCSessionDescriptionInit);
      else if (type === 'answer') handleAnswer(msg.from as number, msg.sdp as RTCSessionDescriptionInit);
      else if (type === 'ice')    handleIce(msg.from as number, msg.candidate as RTCIceCandidateInit);
      else if (type === 'peer-left' || type === 'peer-joined') {
        if (type === 'peer-left') handlePeerLeft(msg.id as number);
        if (type === 'peer-joined') {
          setConnectedPeers((prev) => {
            const next = new Set(prev);
            next.add(msg.id as number);
            return next;
          });
          const lms = localMediaStateRef.current;
          send({ type: 'media-state', to: msg.id, video: lms.video, audio: lms.audio });
        }
      } else if (type === 'media-state') {
        const from = msg.from as number;
        const video = msg.video as boolean;
        const audio = msg.audio as boolean;
        setMediaStates((prev) => {
          const next = new Map(prev);
          next.set(from, { video, audio });
          return next;
        });
      } else if (type === 'chat') {
        onChatRef.current?.({
          from: msg.from as number,
          from_name: msg.from_name as string,
          to: msg.to as number | null,
          text: msg.text as string,
          ts: msg.ts as string,
        });
      }
    };

    ws.onerror = () => onErrorRef.current?.('Signaling connection error');

    return () => {
      isActive = false;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      if (wsRef.current === ws) wsRef.current = null;
      pcsRef.current.forEach((pc) => pc.close());
      pcsRef.current.clear();
      iceCacheRef.current.clear();
      remoteStreamsRef.current.clear();
      setRemoteStreams(new Map());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, participantId, meetingCode, localMediaReady, retryCount]);

  const closeAll = useCallback(() => {
    intentionalCloseRef.current = true;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      wsRef.current.close();
    }
    wsRef.current = null;
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();
    iceCacheRef.current.clear();
    remoteStreamsRef.current.clear();
    setRemoteStreams(new Map());
    setMediaStates(new Map());
    setConnectedPeers(new Set());
  }, []);

  const sendChat = useCallback((text: string, to: number | null) => {
    send({ type: 'chat', text, to });
  }, [send]);

  return { remoteStreams, mediaStates, connectedPeers, closeAll, sendChat };
}
