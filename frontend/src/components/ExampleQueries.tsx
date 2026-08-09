import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { exampleQueries } from '@/data/exampleQueries';

interface ExampleQueriesProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.4,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function ExampleQueries({ onSelect, disabled = false }: ExampleQueriesProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-4 rounded-full bg-orange-500" />
        <h2 className="text-xs tracking-[0.2em] text-white/60 uppercase font-semibold">
          Explore Space Biology Research
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {exampleQueries.map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              variants={cardVariants}
              whileHover={!disabled ? { y: -3, transition: { duration: 0.2 } } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              onClick={() => !disabled && onSelect(item.question)}
              disabled={disabled}
              className={`
                group relative text-left p-4 rounded-xl border border-white/10 bg-black/80
                backdrop-blur-md transition-all duration-300 overflow-hidden shadow-md
                ${disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-orange-500/40 hover:bg-white/[0.04] cursor-pointer'
                }
              `}
              aria-label={`Ask: ${item.question}`}
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden="true"
              />

              <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <Icon className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <span className="text-[10px] tracking-[0.15em] text-amber-300/80 uppercase font-semibold font-mono">
                      {item.category}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>

                <p className="text-xs text-white/80 group-hover:text-white transition-colors duration-200 leading-relaxed font-medium">
                  {item.question}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
