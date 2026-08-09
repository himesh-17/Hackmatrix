import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronLeft, PanelLeft, Orbit, Sparkles, Clock } from 'lucide-react';
import type { ChatSession } from '@/types/research';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigateHome: () => void;
  onNewSession?: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  onNavigateHome,
  onNewSession,
  sessions,
  currentSessionId,
  onSelectSession,
}: SidebarProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className="flex-shrink-0 h-full bg-black border-r border-[#f97316]/30 overflow-hidden flex flex-col backdrop-blur-xl relative z-30 font-sans shadow-[4px_0_20px_rgba(0,0,0,0.9)]"
        >
          {/* Header Controls */}
          <div className="p-3.5 flex items-center justify-between border-b border-[#f97316]/30">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-[10px] font-bold text-white/90 hover:text-white transition-all uppercase tracking-[0.15em] px-3 py-1.5 bg-black hover:bg-white/10 rounded-full border border-[#f97316]/35"
            >
              <Orbit className="w-3 h-3 text-[#f97316]" />
              Exit to Orbit
            </button>
          </div>

          {/* New Session Button */}
          <div className="p-3">
            <button
              onClick={onNewSession}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-black hover:bg-[#f97316]/10 border border-[#f97316]/35 text-white text-xs font-mono font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
              Start New Research
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth">
            <div className="text-[10px] font-bold tracking-widest text-[#f97316]/80 uppercase mb-3 px-2 flex items-center gap-2 font-mono">
              <Clock className="w-3 h-3 text-[#f97316]" />
              Chat History
            </div>

            <div className="space-y-1">
              {sessions.length === 0 ? (
                <div className="text-xs text-white/40 px-2 italic text-center mt-6 py-4 rounded-xl border border-[#f97316]/20 bg-black/50 font-mono">
                  No active chats yet.
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left font-mono truncate border ${
                      currentSessionId === session.id
                        ? 'text-white bg-[#f97316]/10 border-[#f97316]/40'
                        : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent hover:border-[#f97316]/30'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#f97316] flex-shrink-0" />
                    <span className="truncate">{session.title}</span>
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
          className="flex-shrink-0 h-full bg-black border-r border-[#f97316]/30 flex flex-col items-center py-4 gap-4 backdrop-blur-xl relative z-30"
        >
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5 text-[#f97316]" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
