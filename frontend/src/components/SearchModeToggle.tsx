import { useSearchMode } from '@/context/SearchModeContext';
import { motion } from 'framer-motion';
import { Flame, MessageSquare } from 'lucide-react';

export default function SearchModeToggle({ className = '' }: { className?: string }) {
  const { mode, setMode } = useSearchMode();

  const isResearch = mode === 'research';

  return (
    <div className={`relative inline-flex items-center p-1 rounded-full bg-black/90 border border-orange-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.9)] ${className}`}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setMode('research')}
        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          isResearch
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
      >
        <Flame className="w-3.5 h-3.5 text-amber-200" />
        <span>Research Mode</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setMode('casual')}
        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          !isResearch
            ? 'bg-white/20 text-white border border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.3)]'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5 text-white/80" />
        <span>Casual Mode</span>
      </motion.button>
    </div>
  );
}
