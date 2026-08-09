import { useRef, useEffect, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Flame, MessageSquare } from 'lucide-react';
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="relative group">
        {/* Ambient Outer Blackhole Glow */}
        <div
          className={`absolute -inset-0.5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-md pointer-events-none ${
            isResearch
              ? 'bg-gradient-to-r from-amber-600/40 via-orange-600/40 to-amber-600/40'
              : 'bg-gradient-to-r from-white/20 via-white/30 to-white/20'
          }`}
          aria-hidden="true"
        />

        <div className="relative rounded-2xl border border-white/15 bg-black/90 backdrop-blur-2xl overflow-hidden group-focus-within:border-orange-500/40 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.95)]">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isResearch
                ? 'Ask a space biology research question (e.g. OSD-104 muscle transcriptomics)...'
                : 'Ask a casual space biology question...'
            }
            disabled={isLoading}
            rows={1}
            aria-label="Research question input"
            className="w-full bg-transparent text-white placeholder:text-white/40 resize-none px-5 pt-4 pb-14 text-[15px] leading-relaxed focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          />

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                {isResearch ? (
                  <>
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-orange-300/80">Research Mode Active</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3 h-3 text-white/70" />
                    <span className="text-white/70">Casual Mode Active</span>
                  </>
                )}
              </span>
            </div>

            <motion.button
              whileHover={canSubmit ? { scale: 1.03 } : undefined}
              whileTap={canSubmit ? { scale: 0.97 } : undefined}
              onClick={onSubmit}
              disabled={!canSubmit}
              aria-label="Submit research question"
              className={`
                relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 shadow-lg
                ${
                  canSubmit
                    ? isResearch
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:from-amber-400 hover:to-orange-500'
                      : 'bg-white/20 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white/30'
                    : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isResearch ? 'Synthesize' : 'Send'}</span>
                  <Send className="w-3 h-3" />
                </>
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
