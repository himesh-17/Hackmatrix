import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Atom,
  FlaskConical,
  Info,
  Database,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="starfield" aria-hidden="true" />
      <div className="cosmic-glow" aria-hidden="true" />

      <nav
        className="relative z-20 border-b border-space-border/50 backdrop-blur-md bg-space-deep/60"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9">
                <div className="absolute inset-0 rounded-full border border-accent-blue/30" />
                <Atom className="w-5 h-5 text-accent-blue" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wider text-text-primary leading-none">
                  SPACEBIO AI
                </span>
                <span className="text-[10px] tracking-[0.2em] text-text-muted uppercase leading-none mt-0.5">
                  NASA OSDR Research
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <NavLink icon={<FlaskConical className="w-3.5 h-3.5" />} label="Research" active />
              <NavLink icon={<Database className="w-3.5 h-3.5" />} label="Datasets" />
              <NavLink icon={<Info className="w-3.5 h-3.5" />} label="About" />
            </div>

            <button
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-space-surface/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-space-border/30"
            >
              <div className="px-4 py-3 space-y-1 bg-space-deep/80 backdrop-blur-md">
                <MobileNavLink icon={<FlaskConical className="w-4 h-4" />} label="Research" active />
                <MobileNavLink icon={<Database className="w-4 h-4" />} label="Datasets" />
                <MobileNavLink icon={<Info className="w-4 h-4" />} label="About" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10 flex-1">
        {children}
      </main>

      <footer className="relative z-10 border-t border-space-border/30 bg-space-deep/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Atom className="w-4 h-4 text-accent-blue/60" />
              <span className="text-sm text-text-muted">
                NASA OSDR • Space Biology Research Intelligence
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://osdr.nasa.gov/bio/repo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-muted hover:text-text-accent transition-colors flex items-center gap-1.5"
              >
                NASA OSDR
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://genelab.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-muted hover:text-text-accent transition-colors flex items-center gap-1.5"
              >
                GeneLab
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-xs text-text-muted/50">
                Hackathon 2026
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${active
          ? 'text-text-primary bg-space-surface/60'
          : 'text-text-secondary hover:text-text-primary hover:bg-space-surface/30'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavLink({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`
        flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${active
          ? 'text-text-primary bg-space-surface/60'
          : 'text-text-secondary hover:text-text-primary hover:bg-space-surface/30'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
