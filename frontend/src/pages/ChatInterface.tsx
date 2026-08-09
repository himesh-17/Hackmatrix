import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInput from '@/components/ChatInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import ExampleQueries from '@/components/ExampleQueries';
import SearchModeToggle from '@/components/SearchModeToggle';
import { useResearchQuery } from '@/hooks/useResearchQuery';
import { useSearchMode } from '@/context/SearchModeContext';
import { ChevronDown, Orbit } from 'lucide-react';

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/15 via-black to-transparent blur-3xl opacity-70" />
      </div>

      {/* Floating Top Header Toolbar (Matching Mockup) */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        {/* Left: Model Selector Dropdown (matching `ChatGPT 5.1 ∨`) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs font-mono font-medium hover:bg-white/10 transition-colors cursor-pointer">
          <span>SpaceBio 2.5</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/60" />
        </div>

        {/* Center: Brand Logo Emblem (matching `[v0]` in mockup) */}
        <div className="w-8 h-8 rounded-lg border border-orange-500/40 bg-black/80 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <Orbit className="w-4 h-4 text-[#f97316]" />
        </div>

        {/* Right: ONLY Search Mode Toggle Pill in Top Right Corner */}
        <div className="flex items-center">
          <SearchModeToggle />
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth pb-44 pt-8 relative z-10 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {!hasInteracted ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center mt-4"
              >
                {/* Center Header (Matching exact screenshot: "How can I help you today?") */}
                <h2 className="text-3xl sm:text-4xl font-bold font-mono text-white mb-2 tracking-tight">
                  How can I help you today?
                </h2>
                <p className="text-white/50 text-xs sm:text-sm font-mono mb-10">
                  Ask me anything or choose from the suggestions below
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
                        <div className="max-w-[85%] bg-[#1a0f08] border border-[#f97316]/40 px-5 py-3.5 rounded-2xl rounded-tr-sm text-white text-[15px] leading-relaxed shadow-[0_0_20px_rgba(0,0,0,0.8)] font-sans">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      /* Assistant Response Block */
                      <div className="flex justify-start w-full">
                        <div className="max-w-[100%] w-full bg-black/95 rounded-2xl p-6 border border-orange-500/20 shadow-[0_0_40px_rgba(0,0,0,0.95)] backdrop-blur-xl relative">
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
