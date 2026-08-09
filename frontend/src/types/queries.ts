import type { Dna, Orbit, Zap } from 'lucide-react';

export interface ExampleQuery {
  id: string;
  question: string;
  category: string;
  icon: typeof Dna | typeof Orbit | typeof Zap;
}
