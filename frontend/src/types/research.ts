export interface AnswerSource {
  datasetId: string;
  title: string;
  url?: string;
}

export interface ResearchAnswer {
  answer: string;
  sources: AnswerSource[];
}

export interface ResearchQuery {
  question: string;
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';
