import { useState, useCallback } from 'react';
import type { ResearchAnswer, QueryStatus } from '@/types/research';
import { askResearchQuestion } from '@/lib/api';

interface UseResearchQueryReturn {
  query: string;
  setQuery: (q: string) => void;
  status: QueryStatus;
  result: ResearchAnswer | null;
  error: string | null;
  submitQuery: (question?: string) => Promise<void>;
  reset: () => void;
}

export function useResearchQuery(): UseResearchQueryReturn {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [result, setResult] = useState<ResearchAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitQuery = useCallback(async (question?: string) => {
    const q = question ?? query;
    if (!q.trim()) return;

    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const response = await askResearchQuestion(q.trim());
      setResult(response);
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setStatus('error');
    }
  }, [query]);

  const reset = useCallback(() => {
    setQuery('');
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { query, setQuery, status, result, error, submitQuery, reset };
}
