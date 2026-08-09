import { useRef, useEffect, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';

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
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-space-border to-transparent" />
        <span className="text-[11px] tracking-[0.25em] text-text-muted uppercase font-medium">
          Ask the Research Assistant
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-space-border to-transparent" />
      </div>

      <div className="relative group">
        <div
          className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-accent-blue/20 via-accent-indigo/20 to-accent-blue/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm"
          aria-hidden="true"
        />

        <div className="relative rounded-2xl border border-space-border/60 bg-space-surface/40 backdrop-blur-sm overflow-hidden group-focus-within:border-accent-blue/30 transition-colors duration-300">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about space biology..."
            disabled={isLoading}
            rows={1}
            aria-label="Research question input"
            className="w-full bg-transparent text-text-primary placeholder:text-text-muted/60 resize-none px-5 pt-4 pb-14 text-[15px] leading-relaxed focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-space-border/20">
            <span className="text-[11px] text-text-muted/50 font-mono">
              Powered by NASA OSDR datasets
            </span>

            <motion.button
              whileHover={canSubmit ? { scale: 1.05 } : undefined}
              whileTap={canSubmit ? { scale: 0.95 } : undefined}
              onClick={onSubmit}
              disabled={!canSubmit}
              aria-label="Submit research question"
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${canSubmit
                  ? 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20'
                  : 'bg-space-elevated text-text-muted cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Research</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-text-muted/40 mt-3">
        Press <kbd className="px-1.5 py-0.5 rounded bg-space-surface/60 border border-space-border/30 text-text-muted/60 font-mono text-[10px]">Enter</kbd> to submit · <kbd className="px-1.5 py-0.5 rounded bg-space-surface/60 border border-space-border/30 text-text-muted/60 font-mono text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </motion.div>
  );
}
