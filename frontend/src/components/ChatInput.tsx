import { useRef, useEffect, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Loader2, Flame, MessageSquare } from 'lucide-react';
import { useSearchMode } from '@/context/SearchModeContext';

export default function ChatInput({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mode } = useSearchMode();

  const isResearch = mode === 'research';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [query]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const canSubmit = query.trim().length > 0 && !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Rectangular Box with Soft Light Orange Border Outline */}
      <div className="relative rounded-xl border border-[#f97316]/35 bg-black p-4 shadow-[0_0_30px_rgba(0,0,0,0.9)] transition-all duration-300 group focus-within:border-[#f97316]/60 focus-within:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isResearch
              ? 'Ask a space biology research question...'
              : 'Ask anything...'
          }
          disabled={isLoading}
          rows={1}
          aria-label="Research question input"
          className="w-full bg-transparent text-white placeholder:text-white/40 resize-none pt-1 pb-10 text-[15px] leading-relaxed focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-sans overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        />

        {/* Inner Bottom Controls Bar */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Left: Mode Indicator */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/50">
              {isResearch ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-[#f97316]" />
                  <span className="text-[#f97316]/90 font-medium">Research Mode</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-white/60 font-medium">Casual Mode</span>
                </>
              )}
            </span>
          </div>

          {/* Right: Solid Orange Square Submit Button */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <motion.button
              whileHover={canSubmit ? { scale: 1.05 } : undefined}
              whileTap={canSubmit ? { scale: 0.95 } : undefined}
              onClick={onSubmit}
              disabled={!canSubmit}
              aria-label="Submit question"
              className={`
                flex items-center justify-center w-8 h-8 rounded-lg font-bold transition-all duration-300
                ${
                  canSubmit
                    ? 'bg-[#f97316] text-white hover:bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)] cursor-pointer'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/30 mt-2 font-mono">
        Press <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/60">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/10 text-white/60">Shift+Enter</kbd> for line break
      </p>
    </motion.div>
  );
}
