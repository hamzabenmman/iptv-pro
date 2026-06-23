'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send, MessageSquare, UserPlus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
};

const STORAGE_KEY = 'iptv-chat-session';

const getTimeLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const defaultMessages: ChatMessage[] = [
  {
    id: 'welcome',
    sender: 'agent',
    text: 'Welcome to IPTV Pro chat! Use the invite button and stay on site while we assist you.',
    time: getTimeLabel(),
  },
];

export default function ChatWidget() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [input, setInput] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const saved = JSON.parse(stored);
      setMessages(saved.messages || defaultMessages);
      setInviteCode(saved.inviteCode || '');
      setSessionName(saved.sessionName || '');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const saveSession = async () => {
    if (!sessionName) return;
    const code = `IPTV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const state = { messages, inviteCode: code, sessionName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setInviteCode(code);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      time: getTimeLabel(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage.text, name: sessionName, inviteCode }),
      });
      const data = await res.json();

      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply,
        time: getTimeLabel(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: t('error_send'),
        time: getTimeLabel(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const userClass = 'self-end bg-brand-500 text-dark-950';
  const agentClass = 'self-start bg-dark-900 text-white/90 border border-white/10';

  const buttonLabel = inviteCode ? t('session_saved') : t('save_session');

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[360px] max-w-[92vw] rounded-[2rem] border border-white/10 bg-dark-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-brand-500/10 border-b border-white/10">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-400">{t('title')}</p>
              <p className="text-xs text-dark-300">{t('subtitle')}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full bg-white/5 p-2 text-dark-100 hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          <div className="h-[360px] overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-dark-950 to-dark-900">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col gap-2 max-w-[85%] ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                <div className={`rounded-3xl p-3 text-sm leading-6 shadow-sm ${message.sender === 'user' ? userClass : agentClass}`}>
                  {message.text}
                </div>
                <span className="text-[11px] text-dark-400 self-end">{message.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="space-y-3 px-4 py-4 bg-dark-950 border-t border-white/10">
            <div className="grid gap-2">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={t('session_placeholder')}
                className="w-full rounded-3xl border border-white/10 bg-dark-900 px-4 py-3 text-sm text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
              />
              <button
                type="button"
                onClick={saveSession}
                disabled={!sessionName || isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-brand-500 px-4 py-3 text-sm font-semibold text-dark-950 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus size={16} />
                {buttonLabel}
              </button>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-dark-900 p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('input_placeholder')}
                rows={3}
                className="w-full resize-none rounded-3xl border border-white/10 bg-dark-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-dark-400">{inviteCode ? `${t('invite_code')}: ${inviteCode}` : t('invite_prompt')}</span>
                <button
                  type="button"
                  onClick={sendMessage}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-400 px-4 py-2 text-sm font-semibold text-dark-950 transition-all duration-300 hover:bg-brand-300"
                >
                  <Send size={16} />
                  {t('send_button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-semibold text-dark-950 shadow-2xl shadow-brand-500/30 transition-all duration-300 hover:scale-[1.02]"
      >
        <MessageSquare size={18} />
        {t('open_chat')}
      </button>
    </div>
  );
}
