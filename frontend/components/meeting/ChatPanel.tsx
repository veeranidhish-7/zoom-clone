'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  toAll: boolean;
  isMe: boolean;
  recipientName?: string;
}

interface ChatPanelProps {
  onClose: () => void;
  participants: { id: number; name: string; isConnected?: boolean }[];
  messages: ChatMessage[];
  onSendMessage: (text: string, to: number | 'all') => void;
}

export default function ChatPanel({ onClose, participants, messages, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [recipient, setRecipient] = useState<'all' | number>('all');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on open
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim(), recipient);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const recipientLabel = recipient === 'all'
    ? 'Meeting Group Chat'
    : participants.find((p) => p.id === recipient)?.name ?? 'Direct';

  return (
    <div
      role="region"
      aria-label="Chat panel"
      className="flex h-full w-[320px] flex-col bg-[var(--panel-bg)] text-white border-l border-[var(--panel-divider)] animate-in slide-in-from-right-full duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--panel-divider)]">
        <h2 className="text-[14px] font-medium">Meeting Group Chat</h2>
        <button
          onClick={onClose}
          aria-label="Close chat panel"
          className="text-gray-400 hover:text-white p-1 rounded transition focus:outline-none focus:ring-2 focus:ring-[var(--blue-border)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} aria-live="polite" aria-label="Chat messages" className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-gray-500 mt-4">
            No messages yet.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-medium text-[var(--blue-border)]">
                  {m.isMe ? (m.toAll ? 'You to Everyone' : `You to ${m.recipientName}`) : m.sender}
                </span>
                {!m.toAll && !m.isMe && <span className="text-[10px] text-gray-500">→ Direct</span>}
                <span className="text-[10px] text-gray-500">{m.time}</span>
              </div>
              <p className="text-[13px] text-gray-200 break-words">{m.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--panel-divider)]">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[12px] text-gray-400">
            <span>To:</span>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              aria-label="Message recipient"
              className="rounded bg-[var(--blue-button)] px-2 py-0.5 text-white outline-none cursor-pointer focus:ring-2 focus:ring-[var(--blue-border)]"
            >
              <option value="all">Meeting Group Chat</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id} disabled={!p.isConnected}>
                  {p.name} {!p.isConnected ? '(demo)' : '(Direct)'}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${recipientLabel}…`}
              aria-label="Type a message and press Enter to send"
              className="w-full rounded-[8px] bg-[#2a2a2a] px-3 py-2 pr-10 text-[13px] text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[var(--blue-border)]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--blue-chat)] disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--blue-border)] rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
