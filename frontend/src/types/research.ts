export interface AnswerSource {
  datasetId: string;
  title: string;
  url?: string;
  organism?: string;
  sampleCount?: number;
}

export interface ToolExecution {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'error';
  params?: Record<string, any>;
  result?: string;
}

export interface ResearchAnswer {
  answer: string;
  sources: AnswerSource[];
  mode?: 'casual' | 'research';
  toolsExecuted?: ToolExecution[];
  suggestedFollowups?: string[];
  pythonCode?: string;
  pythonOutput?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode: 'casual' | 'research';
  status: QueryStatus;
  result?: ResearchAnswer | null;
  error?: string | null;
}

export interface ResearchQuery {
  question: string;
  mode?: 'casual' | 'research';
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';
