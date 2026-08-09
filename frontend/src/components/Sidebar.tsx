import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronLeft, PanelLeft, Orbit, Sparkles } from 'lucide-react';
import type { ChatHistoryItem } from '@/App';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigateHome: () => void;
  onNewSession?: () => void;
  history: ChatHistoryItem[];
}

export default function Sidebar({ isOpen, onToggle, onNavigateHome, onNewSession, history }: SidebarProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className="flex-shrink-0 h-full bg-black border-r border-white/10 overflow-hidden flex flex-col backdrop-blur-xl relative z-30 font-sans"
        >
          {/* Header Controls: Chevron Left on Top Left */}
          <div className="p-3.5 flex items-center justify-between border-b border-white/10">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 hover:text-white transition-all uppercase tracking-[0.15em] px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10"
            >
              <Orbit className="w-3 h-3 text-[#f97316]" />
              Exit to Orbit
            </button>
          </div>

          {/* Clean New Session Bar */}
          <div className="p-3">
            <button 
              onClick={onNewSession}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
              Start New Research
            </button>
          </div>

          {/* Mission Logs / History List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth">
            <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-3 px-2 flex items-center gap-2 font-mono">
              Mission Logs
            </div>
            
            <div className="space-y-1">
              {history.length === 0 ? (
                <div className="text-xs text-white/40 px-2 italic text-center mt-6 py-4 rounded-xl border border-white/5 bg-white/[0.02] font-mono">
                  No active sessions found.
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all text-left font-mono truncate border border-transparent hover:border-white/5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#f97316]/80 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 56, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className="flex-shrink-0 h-full bg-black border-r border-white/10 flex flex-col items-center py-4 gap-4 backdrop-blur-xl relative z-30"
        >
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
