import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ExternalLink,
  Database,
  AlertCircle,
  RotateCcw,
  FileText,
  Flame,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Code2,
  BrainCircuit,
  MessageSquarePlus,
} from 'lucide-react';
import type { ResearchAnswer, QueryStatus } from '@/types/research';

interface AnswerDisplayProps {
  status: QueryStatus;
  result: ResearchAnswer | null;
  error: string | null;
  onRetry?: () => void;
  onSelectFollowup?: (question: string) => void;
}

const LOADING_MESSAGES = [
  'Initializing SpaceBio Intelligence Agent...',
  'Querying NASA OSDR & GeneLab Repository...',
  'Executing differential gene expression pipeline...',
  'Cross-referencing microgravity tissue transcriptomics...',
  'Synthesizing biological evidence & citations...',
];

export default function AnswerDisplay({
  status,
  result,
  error,
  onRetry,
  onSelectFollowup,
}: AnswerDisplayProps) {
  if (status === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {status === 'loading' && <LoadingState key="loading" />}
        {status === 'error' && <ErrorState key="error" error={error} onRetry={onRetry} />}
        {status === 'success' && result && (
          <SuccessState key="success" result={result} onSelectFollowup={onSelectFollowup} onRetry={onRetry} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative rounded-2xl border border-orange-500/30 bg-black/80 backdrop-blur-xl p-8 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)]"
    >
      {/* Ambient Radial Blackhole Glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-orange-500/40 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-2 rounded-full border border-amber-500/40 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
          <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)] animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] tracking-[0.25em] text-orange-400 uppercase font-semibold flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5" />
            SPACEBIO INTELLIGENCE AGENT
          </span>

          <div className="h-6 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-white/80 font-medium"
              >
                {LOADING_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
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
      className="rounded-2xl border border-red-500/30 bg-black/90 backdrop-blur-xl p-6 shadow-2xl"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 shrink-0">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-400 mb-1">
            Research Query Warning
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            {error || 'An unexpected issue occurred while processing. You can retry or rephrase your query.'}
          </p>
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
              Retry Query
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SuccessState({
  result,
  onSelectFollowup,
  onRetry,
}: {
  result: ResearchAnswer;
  onSelectFollowup?: (question: string) => void;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'python'>('text');

  const handleCopy = () => {
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isResearch = result.mode === 'research';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 w-full"
    >
      {/* Tool Execution Logs (Blackhole Amber Theme) */}
      {result.toolsExecuted && result.toolsExecuted.length > 0 && (
        <div className="rounded-xl border border-orange-500/20 bg-black/60 backdrop-blur-md p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-orange-400">
            <Terminal className="w-3.5 h-3.5" />
            Agent Tool Executions ({result.toolsExecuted.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.toolsExecuted.map((tool) => (
              <div
                key={tool.id}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white/80 font-mono"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white/90 text-xs truncate">{tool.name}</div>
                  <div className="text-[11px] text-white/50 truncate font-sans">{tool.result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Answer Box */}
      <div className="rounded-2xl border border-white/15 bg-black/90 backdrop-blur-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.95)] relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-[11px] tracking-[0.2em] text-white/80 uppercase font-semibold">
              {isResearch ? 'SpaceBio OSDR Synthesis' : 'SpaceBio Assistant Response'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {result.pythonCode && (
              <div className="flex p-0.5 rounded-lg bg-white/5 border border-white/10">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'text' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Synthesis
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                    activeTab === 'python' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  Python Script
                </button>
              </div>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 text-xs"
              title="Copy answer"
            >
              {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Answer Content */}
        <div className="px-6 py-6">
          {activeTab === 'text' ? (
            <div className="text-[15px] text-white/90 leading-relaxed space-y-4">
              {result.answer.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ') || paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-base font-bold text-white tracking-wide pt-2 border-b border-white/5 pb-1">
                      {paragraph.replace(/^#+\s*/, '')}
                    </h3>
                  );
                }
                return (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black border border-orange-500/20 text-amber-300 overflow-x-auto">
                <pre>{result.pythonCode}</pre>
              </div>
              {result.pythonOutput && (
                <div>
                  <div className="text-[11px] text-white/50 uppercase font-sans mb-1 tracking-wider">Output Result</div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/80 overflow-x-auto">
                    <pre>{result.pythonOutput}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[10px] text-white/40 font-mono">
            {isResearch ? 'Verified against NASA OSDR Database' : 'Casual Mode Active'}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-orange-400" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Cited OSDR Datasets */}
      {result.sources && result.sources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-400" />
            <span className="text-[11px] tracking-[0.2em] text-white/70 uppercase font-semibold">
              NASA OSDR Cited Datasets
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] text-amber-300 font-mono">
              {result.sources.length} Studies
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.sources.map((source) => (
              <SourceCard key={source.datasetId} source={source} />
            ))}
          </div>
        </div>
      )}

      {/* Suggested Follow-up Questions */}
      {result.suggestedFollowups && result.suggestedFollowups.length > 0 && onSelectFollowup && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
            <MessageSquarePlus className="w-3.5 h-3.5 text-orange-400" />
            Suggested Follow-up Questions:
          </div>
          <div className="flex flex-wrap gap-2">
            {result.suggestedFollowups.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFollowup(question)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all text-left group"
              >
                <span>{question}</span>
                <ChevronRight className="w-3 h-3 text-white/40 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SourceCard({ source }: { source: any }) {
  return (
    <a
      href={source.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 rounded-xl border border-white/10 bg-black/80 hover:bg-white/[0.04] hover:border-orange-500/40 backdrop-blur-md transition-all duration-300 shadow-md relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold text-amber-300 font-mono tracking-wider">
            {source.datasetId}
          </span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-orange-400 transition-colors" />
      </div>

      <p className="text-xs text-white/80 font-medium leading-snug line-clamp-2 mb-2">
        {source.title}
      </p>

      {source.organism && (
        <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
          <FileText className="w-3 h-3 text-orange-400/70" />
          <span>{source.organism}</span>
          {source.sampleCount && <span>· {source.sampleCount} samples</span>}
        </div>
      )}
    </a>
  );
}
