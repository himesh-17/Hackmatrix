import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInput from '@/components/ChatInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import { useResearchQuery } from '@/hooks/useResearchQuery';
import { useSearchMode } from '@/context/SearchModeContext';
import { ChevronDown, Check, Flame, MessageSquare, Bot } from 'lucide-react';
import type { ChatMessage, ChatSession } from '@/types/research';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onUpdateMessages: (sessionId: string, messages: ChatMessage[], mode: 'casual' | 'research') => void;
}

export default function ChatInterface({ session, onUpdateMessages }: ChatInterfaceProps) {
  const { mode } = useSearchMode();
  const { query, setQuery, status, result, messages, submitQuery } = useResearchQuery(
    session?.messages || []
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasInteracted = messages.length > 0;
  const sessionId = session?.id;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth scroll without jitter
  useEffect(() => {
    if (hasInteracted) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages.length, status, result, hasInteracted]);

  // Persist messages to session whenever they change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      onUpdateMessages(sessionId, messages, mode);
    }
  }, [messages, sessionId, mode, onUpdateMessages]);

  const handleSubmit = useCallback((overrideQuery?: string) => {
    const textToSubmit = overrideQuery ?? query;
    if (!textToSubmit.trim()) return;
    submitQuery(textToSubmit.trim(), mode);
  }, [query, mode, submitQuery]);

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden font-sans">
      {/* Background Subtle Warm Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/10 via-black to-transparent blur-3xl opacity-60" />
      </div>

      {/* Floating Top Header Toolbar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-[#f97316]/30 bg-black/90 backdrop-blur-xl">
        {/* Left: Interactive Dropdown Mode Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#f97316]/35 bg-black text-white text-xs font-mono font-medium hover:border-[#f97316]/60 transition-all cursor-pointer"
          >
            <span>{mode === 'research' ? 'Research Mode 2.5' : 'Casual Mode'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#f97316] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mode Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border border-[#f97316]/35 bg-black shadow-[0_0_25px_rgba(0,0,0,0.9)] p-1.5 z-50 backdrop-blur-2xl"
              >
                <button
                  onClick={() => { setDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                    mode === 'research' ? 'bg-[#f97316]/15 text-[#f97316] font-semibold' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-[#f97316]" />
                    <span>Research Mode 2.5</span>
                  </div>
                  {mode === 'research' && <Check className="w-3.5 h-3.5 text-[#f97316]" />}
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                    mode === 'casual' ? 'bg-white/15 text-white font-semibold' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-white/70" />
                    <span>Casual Mode</span>
                  </div>
                  {mode === 'casual' && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div />
        <div />
      </div>

      {/* Main Chat Stream Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth pb-44 pt-8 relative z-10 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!hasInteracted ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
                className="flex flex-col items-center justify-center min-h-[45vh] text-center mt-16"
              >
                <h2 className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  How can I help you today?
                </h2>
              </motion.div>
            ) : (
              <motion.div
                key="chat-messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-8 w-full pb-8"
              >
                {messages.map((msg) => (
                  <div key={msg.id} className="w-full space-y-4">
                    {msg.role === 'user' ? (
                      <div className="flex justify-end w-full">
                        <div className="max-w-[75%] bg-[#1a120b] border border-[#f97316]/30 px-4 py-2.5 rounded-2xl rounded-tr-sm text-white text-[13.5px] leading-relaxed shadow-sm font-sans">
                          <div className="text-white/90 leading-relaxed font-normal">{msg.content}</div>
                          <div className="text-[10px] text-amber-400/50 text-right mt-1 font-mono">{msg.timestamp || 'Just now'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start items-start gap-3.5 w-full">
                        <div className="w-7 h-7 rounded-full bg-[#f97316]/15 border border-[#f97316]/40 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Bot className="w-3.5 h-3.5 text-[#f97316]" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5 text-left">
                          <AnswerDisplay
                            status={msg.status}
                            result={msg.result || null}
                            error={msg.error || null}
                            onRetry={() => handleSubmit(messages[messages.indexOf(msg) - 1]?.content)}
                            onSelectFollowup={(question) => handleSubmit(question)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Pinned Input Bar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-14 pb-6 px-4 sm:px-6 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            query={query}
            onQueryChange={setQuery}
            onSubmit={() => handleSubmit()}
            isLoading={status === 'loading'}
          />
        </div>
      </div>
    </div>
  );
}
