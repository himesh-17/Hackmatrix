import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInput from '@/components/ChatInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import ExampleQueries from '@/components/ExampleQueries';
import { useResearchQuery } from '@/hooks/useResearchQuery';

interface ChatInterfaceProps {
  onSearch?: (query: string) => void;
}

export default function ChatInterface({ onSearch }: ChatInterfaceProps) {
  const { query, setQuery, status, result, error, submitQuery } = useResearchQuery();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const hasInteracted = status !== 'idle';

  useEffect(() => {
    if (hasInteracted) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status, result, error]);

  const handleExampleSelect = (question: string) => {
    setQuery(question);
    submitQuery(question); // Auto submit for examples
    if (onSearch) onSearch(question);
  };

  const handleSubmit = () => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
    submitQuery();
  };

  return (
    <div className="flex flex-col h-full bg-[#18181b] relative">

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth pb-32 pt-8 relative z-10 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-8">
          
          <AnimatePresence mode="wait">
            {!hasInteracted ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="flex flex-col items-center justify-center min-h-[40vh] text-center mt-12"
              >
                <div className="w-16 h-16 mb-6 rounded-2xl bg-[#27272a] border border-[#3f3f46] flex items-center justify-center shadow-inner">
                  <svg className="w-8 h-8 text-[#fafafa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-[#fafafa] mb-2 tracking-wide drop-shadow-md">How can I help with your space biology research?</h2>
                <p className="text-[#a1a1aa] mb-10 font-light">Access NASA OSDR datasets and experiments.</p>
                
                <div className="w-full max-w-2xl text-left">
                  <ExampleQueries onSelect={handleExampleSelect} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-8 w-full pb-8"
              >
                {/* User Message Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#27272a] border border-[#3f3f46] px-5 py-3 rounded-2xl rounded-tr-sm text-[#fafafa] leading-relaxed shadow-sm">
                    {query}
                  </div>
                </div>

                {/* AI Response Area */}
                <div className="flex justify-start">
                  <div className="max-w-[100%] w-full bg-[#18181b] rounded-2xl p-6 border border-[#27272a] shadow-sm">
                    <AnswerDisplay
                      status={status}
                      result={result}
                      error={error}
                      onRetry={handleSubmit}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Pinned Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#18181b] via-[#18181b] to-transparent pt-20 pb-6 px-4 sm:px-6 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
            isLoading={status === 'loading'}
          />
          <div className="text-center mt-3 text-xs text-[#71717a] tracking-wide">
            SpaceBio Intelligence can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
