import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Telescope, Satellite, Activity } from 'lucide-react';
import ChatInput from '@/components/ChatInput';
import AnswerDisplay from '@/components/AnswerDisplay';
import ExampleQueries from '@/components/ExampleQueries';
import { useResearchQuery } from '@/hooks/useResearchQuery';

export default function ResearchDashboard() {
  const { query, setQuery, status, result, error, submitQuery } = useResearchQuery();
  const queryAreaRef = useRef<HTMLDivElement>(null);

  const handleExampleSelect = (question: string) => {
    setQuery(question);
    queryAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = () => {
    submitQuery();
  };

  return (
    <div className="relative">
      <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04]">
            <div className="absolute inset-0 rounded-full border border-accent-blue animate-orbit" />
            <div className="absolute inset-8 rounded-full border border-accent-indigo animate-orbit-reverse" />
            <div className="absolute inset-20 rounded-full border border-accent-cyan/50" />
          </div>

          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent-blue/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-space-border/40 bg-space-surface/30 backdrop-blur-sm mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span className="text-[11px] tracking-[0.15em] text-text-muted uppercase font-medium">
              Research System Active
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-text-primary">NASA Space Biology</span>
              <br />
              <span className="bg-gradient-to-r from-accent-blue via-accent-indigo to-accent-cyan bg-clip-text text-transparent">
                Research Intelligence
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary leading-relaxed mb-10"
          >
            Explore biological responses to the extreme environments of space through
            AI-powered synthesis of NASA&apos;s open research datasets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center gap-6 sm:gap-10"
          >
            <TrustIndicator icon={<Telescope className="w-4 h-4" />} label="OSDR Datasets" value="500+" />
            <div className="w-px h-8 bg-space-border/30" />
            <TrustIndicator icon={<Satellite className="w-4 h-4" />} label="Experiments" value="1,200+" />
            <div className="w-px h-8 bg-space-border/30 hidden sm:block" />
            <div className="hidden sm:block">
              <TrustIndicator icon={<Activity className="w-4 h-4" />} label="Organisms" value="30+" />
            </div>
          </motion.div>
        </div>
      </section>

      <section
        ref={queryAreaRef}
        className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
      >
        <ChatInput
          query={query}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
          isLoading={status === 'loading'}
        />
      </section>

      {status === 'idle' && (
        <section className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExampleQueries
            onSelect={handleExampleSelect}
          />
        </section>
      )}

      <section className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnswerDisplay
          status={status}
          result={result}
          error={error}
          onRetry={handleSubmit}
        />
      </section>

      <div className="h-16" />
    </div>
  );
}

function TrustIndicator({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5 text-accent-blue/60">
        {icon}
        <span className="text-lg font-semibold text-text-primary font-mono">{value}</span>
      </div>
      <span className="text-[10px] tracking-[0.1em] text-text-muted uppercase">{label}</span>
    </div>
  );
}
