'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale } from 'next-intl';
import {
  Send, MessageSquare, X, Sparkles, Trophy, Bot, User, ExternalLink,
  CheckCircle, XCircle, ChevronRight, RefreshCw
} from 'lucide-react';

// ===== TYPES =====
type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
  isTyping?: boolean;
  suggestions?: string[];
  quiz?: QuizData;
};

type QuizData = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

type ConversationHistory = {
  role: 'user' | 'assistant';
  content: string;
};

const STORAGE_KEY = 'iptv-chat-session';
const getTimeLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ===== SUGGESTION CHIPS =====
const QUICK_SUGGESTIONS = [
  { icon: '🏆', text: 'Give me a football quiz!' },
  { icon: '⚽', text: 'Show me live scores' },
  { icon: '📺', text: 'What are your prices?' },
  { icon: '🔥', text: 'World Cup 2026 updates' },
];

// ===== TYPING ANIMATION =====
function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-yellow-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-dark-950" />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-400/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
    </div>
  );
}

// ===== QUIZ CARD =====
function QuizCard({ quiz, onAnswer, answered, selected }: {
  quiz: QuizData;
  onAnswer: (index: number) => void;
  answered: number | null;
  selected: number | null;
}) {
  if (!quiz) return null;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-gradient-to-br from-dark-900 to-dark-800 border border-brand-500/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Football Quiz</span>
      </div>
      <p className="text-white text-sm font-medium leading-relaxed">{quiz.question}</p>
      <div className="space-y-1.5">
        {quiz.options.map((option, index) => {
          const isCorrect = index === quiz.correct;
          const isSelected = selected === index;
          const isAnswered = answered !== null;
          let btnClass = 'border-white/10 text-gray-300 hover:border-brand-500/30 hover:text-white';

          if (isAnswered) {
            if (isCorrect) {
              btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
            } else if (isSelected && !isCorrect) {
              btnClass = 'border-red-500 bg-red-500/10 text-red-400';
            }
          }

          return (
            <button
              key={index}
              onClick={() => !isAnswered && onAnswer(index)}
              disabled={isAnswered}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${btnClass} ${!isAnswered ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isAnswered && isCorrect ? 'bg-emerald-500 text-white' :
                isAnswered && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                'bg-dark-800 text-gray-400'
              }`}>
                {isAnswered && isCorrect ? '\u2713' : isAnswered && isSelected ? '\u2717' : optionLabels[index]}
              </span>
              <span className="flex-1 text-left">{option}</span>
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <div className={`p-3 rounded-xl text-xs leading-relaxed ${
          selected === quiz.correct
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {selected === quiz.correct ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Correct!</>
            ) : (
              <><XCircle className="w-3.5 h-3.5" /> Not quite! The answer was: {quiz.options[quiz.correct]}</>
            )}
          </div>
          {quiz.explanation}
        </div>
      )}
    </div>
  );
}

// ===== MAIN CHAT WIDGET =====
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [lastQuizId, setLastQuizId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const locale = useLocale();

  // Load saved session
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const saved = JSON.parse(stored);
        if (saved.sessionName) {
          setMessages(saved.messages || []);
          setSessionName(saved.sessionName);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset quiz state when a new quiz message arrives
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.quiz && lastMsg.id !== lastQuizId) {
      setQuizAnswer(null);
      setSelectedAnswer(null);
      setLastQuizId(lastMsg.id);
    }
  }, [messages, lastQuizId]);

  // Save session
  const saveSession = () => {
    if (!sessionName) return;
    const state = { messages, sessionName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Send welcome message with suggestions
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        id: 'welcome',
        sender: 'agent',
        time: getTimeLabel(),
        text: `Hey ${sessionName}! I'm your AI sports assistant. I can help you with:\n\n\u2022 **Live scores** & match updates\n\u2022 **Football quizzes** & trivia\n\u2022 **IPTV Pro** subscription info\n\u2022 **World Cup 2026** news\n\nWhat would you like to talk about?`,
        suggestions: ['Give me a football quiz!', 'Show me live scores', 'What are your prices?', 'World Cup 2026 updates'],
      };
      setMessages([welcome]);
    }
  };

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0 && sessionName) {
      const state = { messages, sessionName };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [messages, sessionName]);

  // Send message
  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setShowSuggestions(false);

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      time: getTimeLabel(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Reset quiz state
    setQuizAnswer(null);
    setSelectedAnswer(null);

    // Show typing indicator
    const typingId = `typing-${Date.now()}`;
    const typingMsg: ChatMessage = {
      id: typingId,
      sender: 'agent',
      text: '',
      time: getTimeLabel(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMsg]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history: ConversationHistory[] = messages
        .filter(m => m.sender === 'user' || (m.sender === 'agent' && !m.isTyping && !m.quiz))
        .slice(-8)
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText, name: sessionName, history, locale }),
      });

      const data = await res.json();

      // Remove typing indicator
      setMessages((prev) => prev.filter(m => m.id !== typingId));

      // Determine suggestions
      let suggestions = data.suggestions || [];
      if (suggestions.length === 0) {
        suggestions = ['Give me a football quiz!', 'Show me live scores', 'World Cup 2026 updates', 'Contact WhatsApp'];
      }

      // Build agent message
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || 'Hey! How can I help you today?',
        time: getTimeLabel(),
        suggestions: suggestions.slice(0, 4),
      };

      // Add quiz data if present
      if (data.quiz) {
        agentMsg.quiz = data.quiz;
      }

      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      setMessages((prev) => prev.filter(m => m.id !== typingId));
      const errorMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: 'Sorry, I had a glitch! Try again or reach us on WhatsApp at +212 670-799985.',
        time: getTimeLabel(),
        suggestions: ['Try again', 'Contact WhatsApp', 'Back to home'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    setQuizAnswer(index);

    // Find the latest quiz message and add a follow-up
    setMessages((prev) => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].sender === 'agent' && updated[i].quiz) {
          const quizData = updated[i].quiz!;
          const isCorrect = index === quizData.correct;
          const followUp: ChatMessage = {
            id: `agent-quiz-${Date.now()}`,
            sender: 'agent',
            text: isCorrect
              ? `**Correct!** ${quizData.explanation}\n\nWant another quiz or shall we talk about something else?`
              : `**Not quite!** The correct answer was: **${quizData.options[quizData.correct]}**\n\n${quizData.explanation}\n\nWant to try another one?`,
            time: getTimeLabel(),
            suggestions: ['Another quiz!', 'Show me live matches', 'Tell me about IPTV Pro'],
          };
          updated.splice(i + 1, 0, followUp);
          break;
        }
      }
      return updated;
    });
  };

  // Render message text with bold support + clickable links
  const renderMessageText = (text: string) => {
    // Convert markdown-style links [text](url) first
    let formatted = text
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors">$1 <svg class="inline w-3 h-3 ml-0.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a>')
      // Also detect bare URLs http/https
      .replace(/https?:\/\/[^\s<]+/g, '<a href="$&" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors">$& <svg class="inline w-3 h-3 ml-0.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // ===== UI =====
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-yellow-600 px-5 py-3.5 text-sm font-bold text-dark-950 shadow-2xl shadow-brand-500/30 transition-all duration-300 hover:scale-105 hover:shadow-brand-500/40"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">AI Sports Chat</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end gap-3">
      <div className="w-[380px] max-w-[94vw] rounded-3xl border border-brand-500/15 bg-dark-950/98 shadow-2xl shadow-black/50 backdrop-blur-2xl overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="relative bg-gradient-to-r from-brand-500/15 via-dark-900 to-yellow-500/15 border-b border-white/5 px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Bot className="w-5 h-5 text-dark-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">Sports AI</p>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">LIVE</span>
                </div>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {sessionName && (
                <button
                  onClick={() => { setMessages([]); setShowSuggestions(true); setQuizAnswer(null); setSelectedAnswer(null); setLastQuizId(null); localStorage.removeItem(STORAGE_KEY); setSessionName(''); }}
                  className="p-2 rounded-xl hover:bg-dark-800 text-gray-500 hover:text-red-400 transition-all"
                  title="New chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-dark-800 text-gray-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trending bar */}
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto scrollbar-hide">
            {['World Cup', 'Live', 'Trending'].map((tag, i) => (
              <span key={i} className="shrink-0 px-2 py-0.5 rounded-full bg-brand-500/8 text-brand-400 text-[9px] font-medium border border-brand-500/10 whitespace-nowrap">
                {i === 0 ? '\uD83C\uDFC6 ' : i === 1 ? '\u26BD ' : '\uD83D\uDD25 '}{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ===== MESSAGES ===== */}
        <div className="h-[400px] overflow-y-auto px-3 py-3 space-y-3 bg-gradient-to-b from-dark-950 to-dark-900 scrollbar-thin">
          {/* Name prompt if not set */}
          {!sessionName && messages.length === 0 && (
            <div className="text-center py-6 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-yellow-500/20 flex items-center justify-center mx-auto mb-4 border border-brand-500/10">
                <Bot className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">AI Sports Assistant</h3>
              <p className="text-gray-500 text-sm mb-4">Your personal football & IPTV guide</p>
              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveSession()}
                  placeholder="Enter your name..."
                  className="w-full rounded-xl border border-white/10 bg-dark-800/80 px-4 py-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  autoFocus
                />
                <button
                  onClick={saveSession}
                  disabled={!sessionName}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-yellow-600 px-4 py-3 text-sm font-bold text-dark-950 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Chatting
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => {
            if (message.isTyping) return <TypingIndicator key={message.id} />;

            return (
              <div key={message.id} className={`flex flex-col gap-2 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 max-w-[90%]">
                  {message.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500/30 to-yellow-500/30 flex items-center justify-center shrink-0 border border-brand-500/10">
                      <Bot className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                  )}

                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-brand-500 text-dark-950 rounded-tr-md'
                      : 'bg-dark-800/60 border border-white/5 text-gray-200 rounded-tl-md'
                  }`}>
                    {renderMessageText(message.text)}
                    {message.quiz && (
                      <div className="mt-3">
                        <QuizCard
                          quiz={message.quiz}
                          onAnswer={handleQuizAnswer}
                          answered={quizAnswer}
                          selected={selectedAnswer}
                        />
                      </div>
                    )}
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 border border-brand-500/10">
                      <User className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                  )}
                </div>

                <span className={`text-[10px] text-gray-600 px-2 ${message.sender === 'user' ? 'mr-10' : 'ml-10'}`}>
                  {message.time}
                </span>

                {/* Suggestion chips */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1 ml-9 max-w-[85%]">
                    {message.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleSuggestionClick(suggestion);
                          // Smooth scroll to bottom after sending
                          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800/40 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 hover:bg-brand-500/5 transition-all text-[11px] font-medium"
                      >
                        <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ===== INPUT AREA ===== */}
        <div className="border-t border-white/5 bg-dark-950 p-3 space-y-2">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={sessionName ? 'Ask me anything about sports...' : 'Enter your name above to start...'}
              rows={1}
              disabled={!sessionName}
              className="flex-1 resize-none rounded-xl border border-white/5 bg-dark-800/50 px-4 py-3 text-sm text-white outline-none focus:border-brand-500/30 focus:ring-2 focus:ring-brand-500/10 transition-all placeholder-gray-600 max-h-24"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !sessionName || isLoading}
              className="shrink-0 w-[44px] h-[44px] rounded-xl bg-gradient-to-r from-brand-500 to-yellow-600 flex items-center justify-center text-dark-950 transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick suggestions on first visit */}
          {showSuggestions && sessionName && messages.length <= 2 && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {QUICK_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowSuggestions(false);
                    sendMessage(suggestion.text);
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800/40 border border-white/5 text-gray-400 hover:text-brand-400 hover:border-brand-500/20 hover:bg-brand-500/5 transition-all text-[11px] font-medium"
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Footer with links */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] text-gray-500">Powered by Gemini AI</span>
            <div className="flex items-center gap-2">
              <a
                href={`/${locale}/blog`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Blog
              </a>
              <span className="text-[9px] text-gray-600">·</span>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '212670799985'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
