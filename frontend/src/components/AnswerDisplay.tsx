import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ExternalLink,
  Database,
  AlertCircle,
  RotateCcw,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { ResearchAnswer, QueryStatus } from '@/types/research';

interface AnswerDisplayProps {
  status: QueryStatus;
  result: ResearchAnswer | null;
  error: string | null;
  onRetry?: () => void;
}

const LOADING_MESSAGES = [
  'Searching NASA OSDR datasets...',
  'Analyzing biological evidence...',
  'Cross-referencing spaceflight experiments...',
  'Synthesizing research findings...',
  'Preparing cited conclusions...',
];

export default function AnswerDisplay({ status, result, error, onRetry }: AnswerDisplayProps) {
  if (status === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {status === 'loading' && <LoadingState key="loading" />}
        {status === 'error' && <ErrorState key="error" error={error} onRetry={onRetry} />}
        {status === 'success' && result && <SuccessState key="success" result={result} />}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative rounded-2xl border border-space-border/40 bg-space-surface/20 backdrop-blur-sm p-8 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent animate-scan-line" />
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border border-accent-blue/20 animate-orbit" />
          <div className="absolute inset-2 rounded-full border border-accent-indigo/30 animate-orbit-reverse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse-glow" />
          </div>
          <div className="absolute inset-0 animate-orbit">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-1.5 h-1.5 rounded-full bg-accent-cyan/70" />
          </div>
          <div className="absolute inset-0 animate-orbit-reverse">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 w-1 h-1 rounded-full bg-accent-violet/70" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] tracking-[0.25em] text-accent-blue uppercase font-medium">
            Analyzing Research Query
          </span>

          <div className="h-5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-text-muted"
              >
                {LOADING_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-accent-blue/40 animate-node-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ErrorState({ error, onRetry }: { error: string | null; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-2xl border border-status-error/20 bg-status-error/5 backdrop-blur-sm p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-error/10 border border-status-error/20 shrink-0">
          <AlertCircle className="w-5 h-5 text-status-error" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-status-error mb-1">
            Research Query Failed
          </h3>
          <p className="text-sm text-text-secondary">
            {error || 'An unexpected error occurred while processing your query. Please try again.'}
          </p>
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-space-surface/60 border border-space-border/40 text-sm text-text-primary hover:border-space-border-light/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Query
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SuccessState({ result }: { result: ResearchAnswer }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-space-border/40 bg-space-surface/20 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-space-border/20 bg-space-surface/20">
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          <span className="text-[11px] tracking-[0.2em] text-text-muted uppercase font-medium">
            Research Synthesis
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span className="text-[10px] text-status-success/70 font-mono">AI Generated</span>
          </div>
        </div>

        <div className="px-6 py-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {result.answer.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className="text-[15px] text-text-primary/90 leading-[1.8] mb-4 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </div>

      {result.sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-accent-indigo/70" />
            <span className="text-[11px] tracking-[0.2em] text-text-muted uppercase font-medium">
              Sources — NASA OSDR Datasets
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-space-surface/60 border border-space-border/30 text-[10px] text-text-muted font-mono">
              {result.sources.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.sources.map((source, index) => (
              <motion.div
                key={source.datasetId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <SourceCard
                  datasetId={source.datasetId}
                  title={source.title}
                  url={source.url}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function SourceCard({ datasetId, title, url }: { datasetId: string; title: string; url?: string }) {
  const content = (
    <div
      className={`
        group relative p-4 rounded-xl border border-space-border/30 bg-space-surface/20
        backdrop-blur-sm transition-all duration-300 overflow-hidden h-full
        ${url ? 'hover:border-accent-blue/30 hover:bg-space-surface/40 cursor-pointer' : ''}
      `}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-accent-blue/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-accent-cyan/60" />
            <span className="text-[10px] tracking-[0.15em] text-accent-cyan/60 uppercase font-medium">
              NASA OSDR
            </span>
          </div>
          {url && (
            <ExternalLink className="w-3 h-3 text-text-muted/30 group-hover:text-accent-blue/60 transition-colors" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-accent-blue/70" />
          <span className="text-sm font-semibold text-text-primary font-mono">
            {datasetId}
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {title}
        </p>

        {url && (
          <span className="text-[11px] text-accent-blue/60 group-hover:text-accent-blue font-medium flex items-center gap-1 transition-colors">
            View Dataset
            <ArrowIndicator />
          </span>
        )}
      </div>
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return content;
}

function ArrowIndicator() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block">
      <path
        d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
