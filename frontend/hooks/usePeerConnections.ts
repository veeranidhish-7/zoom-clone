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
  enabled: boolean;
  onError?: (msg: string) => void;
}

type RemoteStreams = Map<number, MediaStream>;

export function usePeerConnections({
  meetingCode,
  participantId,
  localStream,
  enabled,
  onError,
}: Options) {
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>(new Map());

  const wsRef = useRef<WebSocket | null>(null);
  const pcsRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const iceCacheRef = useRef<Map<number, RTCIceCandidateInit[]>>(new Map());
  const remoteStreamsRef = useRef<RemoteStreams>(new Map());
  // Keep refs so async signal handlers always read latest values
  const localStreamRef = useRef<MediaStream | null>(localStream);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; });

  // ── helpers ───────────────────────────────────────────────────────────────

  const send = useCallback((msg: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

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
  }, [updateRemoteStream]);

  const createPc = useCallback((peerId: number): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: getIceServers() });
    pcsRef.current.set(peerId, pc);

    // Add local tracks
    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const remoteStream = new MediaStream();
    pc.ontrack = (ev) => {
      (ev.streams[0] ?? { getTracks: () => [ev.track] })
        .getTracks?.()
        .forEach?.((t: MediaStreamTrack) => remoteStream.addTrack(t));
      if (!remoteStream.getTracks().length) remoteStream.addTrack(ev.track);
      updateRemoteStream(peerId, remoteStream);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) send({ type: 'ice', to: peerId, candidate: ev.candidate });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        onErrorRef.current?.(`Connection to participant ${peerId} failed`);
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

  // ── signal handlers ──────────────────────────────────────────────────────

  const handlePeers = useCallback(async (peers: number[]) => {
    for (const peerId of peers) {
      if (pcsRef.current.has(peerId)) continue;
      const pc = createPc(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send({ type: 'offer', to: peerId, sdp: offer });
      } catch (e) { console.error('offer error for', peerId, e); }
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
    } catch (e) { console.error('answer error for', from, e); }
  }, [createPc, drainIceCache, send]);

  const handleAnswer = useCallback(async (from: number, sdp: RTCSessionDescriptionInit) => {
    const pc = pcsRef.current.get(from);
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await drainIceCache(from, pc);
    } catch (e) { console.error('set answer error for', from, e); }
  }, [drainIceCache]);

  const handleIce = useCallback(async (from: number, candidate: RTCIceCandidateInit) => {
    const pc = pcsRef.current.get(from);
    if (!pc || !pc.remoteDescription) {
      const cache = iceCacheRef.current.get(from) ?? [];
      cache.push(candidate);
      iceCacheRef.current.set(from, cache);
      return;
    }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* ignore */ }
  }, []);

  const handlePeerLeft = useCallback((peerId: number) => {
    closePeer(peerId);
  }, [closePeer]);

  // ── WebSocket setup ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!enabled || !participantId) return;

    const ws = new WebSocket(wsUrl(meetingCode, participantId));
    wsRef.current = ws;

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
        // peer-joined: wait for their offer, no action needed
      }
    };

    ws.onerror = () => onErrorRef.current?.('Signaling connection error');

    return () => {
      ws.close();
      wsRef.current = null;
      pcsRef.current.forEach((pc) => pc.close());
      pcsRef.current.clear();
      iceCacheRef.current.clear();
      remoteStreamsRef.current.clear();
      setRemoteStreams(new Map());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, participantId, meetingCode]);

  const closeAll = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();
    iceCacheRef.current.clear();
    remoteStreamsRef.current.clear();
    setRemoteStreams(new Map());
  }, []);

  // ── replaceVideoTrack: call after local camera toggle (no renegotiation) ──
  const replaceVideoTrack = useCallback((track: MediaStreamTrack | null) => {
    pcsRef.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video' || (s.track === null && track?.kind === 'video'));
      if (sender) {
        sender.replaceTrack(track).catch((e) => console.error('replaceTrack error', e));
      } else if (track) {
        // No video sender yet (joined without camera): add the track
        const stream = localStreamRef.current;
        if (stream) pc.addTrack(track, stream);
      }
    });
  }, []);

  return { remoteStreams, closeAll, replaceVideoTrack };
}
