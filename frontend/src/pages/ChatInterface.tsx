import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInput from '@/components/ChatInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import ExampleQueries from '@/components/ExampleQueries';
import SearchModeToggle from '@/components/SearchModeToggle';
import { useResearchQuery } from '@/hooks/useResearchQuery';
import { useSearchMode } from '@/context/SearchModeContext';
import { Bot, Flame } from 'lucide-react';

interface ChatInterfaceProps {
  onSearch?: (query: string) => void;
}

export default function ChatInterface({ onSearch }: ChatInterfaceProps) {
  const { query, setQuery, status, result, messages, submitQuery } = useResearchQuery();
  const { mode } = useSearchMode();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hasInteracted = messages.length > 0;

  // Smooth scroll without jitter
  useEffect(() => {
    if (hasInteracted) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages.length, status, result, hasInteracted]);

  const handleExampleSelect = (question: string) => {
    setQuery(question);
    submitQuery(question, mode);
    if (onSearch) onSearch(question);
  };

  const handleSubmit = (overrideQuery?: string) => {
    const textToSubmit = overrideQuery ?? query;
    if (!textToSubmit.trim()) return;

    if (onSearch) onSearch(textToSubmit.trim());
    submitQuery(textToSubmit.trim(), mode);
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden font-sans">
      {/* Background Hero Blackhole Ambient Warm Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/20 via-orange-950/15 to-transparent blur-3xl opacity-80" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[450px] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900/15 via-black to-transparent blur-3xl opacity-60" />
      </div>

      {/* Floating Top Header Toolbar with Toggle in Top Right Corner */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider">SPACEBIO ASSISTANT</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-mono border border-orange-500/30">
                v2.5 OSDR
              </span>
            </div>
            <p className="text-[10px] text-white/50 font-light">NASA Open Science Data Repository Intelligence</p>
          </div>
        </div>

        {/* SINGLE PLACE: Top Right Corner Search Mode Toggle */}
        <div className="flex items-center">
          <SearchModeToggle />
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth pb-44 pt-6 relative z-10 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {!hasInteracted ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center mt-6"
              >
                {/* Hero Center Blackhole Emblem */}
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-600/20 to-black border border-orange-500/30 backdrop-blur-md shadow-[0_0_35px_rgba(249,115,22,0.35)] animate-pulse" />
                  <Bot className="w-10 h-10 text-white relative z-10" />
                </div>

                <h2 className="text-3xl font-light text-white mb-3 tracking-wide drop-shadow-md">
                  Decode Space Biology <span className="font-semibold text-orange-400">Intelligence</span>
                </h2>
                <p className="text-white/60 mb-10 font-light max-w-lg leading-relaxed text-sm">
                  Synthesize transcriptomics, radiation damage, and muscle atrophy studies from NASA's Open Science Data Repository.
                </p>

                <div className="w-full max-w-2xl text-left">
                  <ExampleQueries onSelect={handleExampleSelect} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-8 w-full pb-8"
              >
                {/* Render Multi-Turn Message Thread */}
                {messages.map((msg) => (
                  <div key={msg.id} className="w-full space-y-4">
                    {msg.role === 'user' ? (
                      /* User Message Bubble */
                      <div className="flex justify-end">
                        <div className="max-w-[85%] bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-orange-500/40 px-5 py-3.5 rounded-2xl rounded-tr-sm text-white text-[15px] leading-relaxed shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      /* Assistant Response Block */
                      <div className="flex justify-start w-full">
                        <div className="max-w-[100%] w-full bg-black/90 rounded-2xl p-6 border border-orange-500/20 shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-xl relative">
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-16 pb-6 px-4 sm:px-6 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            query={query}
            onQueryChange={setQuery}
            onSubmit={() => handleSubmit()}
            isLoading={status === 'loading'}
          />
          <div className="text-center mt-2.5 text-[11px] text-white/40 tracking-wide font-mono">
            SpaceBio Intelligence · NASA OSDR Datasets & Spaceflight Biological Evidence
          </div>
        </div>
      </div>
    </div>
  );
}
