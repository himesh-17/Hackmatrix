import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, PanelLeftClose, PanelLeft, History, Orbit } from 'lucide-react';
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
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className="flex-shrink-0 h-full bg-black/95 border-r border-white/10 overflow-hidden flex flex-col backdrop-blur-xl relative z-30"
        >
          {/* Header Controls */}
          <div className="p-3.5 flex items-center justify-between border-b border-white/10">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 hover:text-white transition-all uppercase tracking-[0.15em] px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-md"
            >
              <Orbit className="w-3 h-3 text-orange-400" />
              Exit to Orbit
            </button>
          </div>

          {/* New Session Button */}
          <div className="p-3.5">
            <button 
              onClick={onNewSession}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Research Session
            </button>
          </div>

          {/* Mission Logs / History */}
          <div className="flex-1 overflow-y-auto px-3.5 py-2 scroll-smooth">
            <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-3 px-2 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-amber-400/80" />
              Mission Logs
            </div>
            
            <div className="space-y-1.5">
              {history.length === 0 ? (
                <div className="text-xs text-white/40 px-2 italic text-center mt-6 py-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  No active sessions found.
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex flex-col gap-1 px-3.5 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all text-left group border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-white/40 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                      <span className="truncate font-medium text-xs leading-snug">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-white/30 ml-6 tracking-wider font-mono">{item.timestamp}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className="flex-shrink-0 h-full bg-black/95 border-r border-white/10 flex flex-col items-center py-4 gap-4 backdrop-blur-xl relative z-30"
        >
          <button
            onClick={onToggle}
            className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-px bg-white/10 my-1" />
          <button
            onClick={onNewSession}
            className="p-2.5 rounded-xl text-white/80 hover:text-white bg-orange-600/30 border border-orange-500/30 hover:bg-orange-600/50 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            title="New Research Session"
          >
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
