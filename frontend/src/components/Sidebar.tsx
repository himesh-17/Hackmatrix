import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, PanelLeftClose, PanelLeft, History } from 'lucide-react';
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
          className="flex-shrink-0 h-full bg-[#09090b] border-r border-[#27272a] overflow-hidden flex flex-col"
        >
          <div className="p-3 flex items-center justify-between">
            <button
              onClick={onToggle}
              className="p-2 rounded-md text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <button
              onClick={onNavigateHome}
              className="text-[10px] font-bold text-[#a1a1aa] hover:text-[#fafafa] transition-colors uppercase tracking-[0.15em] px-2 py-1 bg-[#18181b] rounded-full border border-[#27272a]"
            >
              Exit to Orbit
            </button>
          </div>

          <div className="px-3 pb-4">
            <button 
              onClick={onNewSession}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#fafafa] text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#3b82f6]" />
              New Research Session
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth">
             <div className="text-[10px] font-bold tracking-widest text-[#71717a] uppercase mb-3 px-2 flex items-center gap-2">
              <History className="w-3 h-3" />
              Mission Logs
            </div>
            
            <div className="space-y-1">
              {history.length === 0 ? (
                <div className="text-xs text-[#71717a] px-2 italic text-center mt-4">
                  No previous sessions found.
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex flex-col gap-1 px-3 py-2.5 rounded-md text-sm text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors text-left group border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-[#71717a] group-hover:text-[#fafafa] transition-colors flex-shrink-0" />
                      <span className="truncate font-medium">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-[#71717a] ml-7 tracking-wider">{item.timestamp}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 60, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className="flex-shrink-0 h-full bg-[#09090b] border-r border-[#27272a] flex flex-col items-center py-3"
        >
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={onNewSession}
            className="p-2 rounded-md text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
