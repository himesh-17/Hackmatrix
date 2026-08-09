import { useState, useCallback } from 'react';
import type { ResearchAnswer, QueryStatus, ChatMessage } from '@/types/research';
import { askResearchQuestion } from '@/lib/api';

interface UseResearchQueryReturn {
  query: string;
  setQuery: (q: string) => void;
  status: QueryStatus;
  result: ResearchAnswer | null;
  error: string | null;
  messages: ChatMessage[];
  submitQuery: (question?: string, mode?: 'casual' | 'research') => Promise<void>;
  reset: () => void;
}

export function useResearchQuery(initialMessages: ChatMessage[] = []): UseResearchQueryReturn {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [result, setResult] = useState<ResearchAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const submitQuery = useCallback(async (question?: string, mode: 'casual' | 'research' = 'research') => {
    const q = question ?? query;
    if (!q.trim()) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: q.trim(),
      timestamp: timeStr,
      mode,
      status: 'success',
    };

    const assistantMsgPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: timeStr,
      mode,
      status: 'loading',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsgPlaceholder]);
    setStatus('loading');
    setError(null);
    setQuery('');

    try {
      // Build history from previous assistant messages (last 6 messages = 3 turns)
      const history = messages
        .filter((m) => m.role === 'assistant' && m.content)
        .slice(-3)
        .map((m) => {
          const userMsgForAnswer = messages.find(
            (um) => um.role === 'user' && um.timestamp <= m.timestamp
          );
          return {
            question: userMsgForAnswer?.content || '',
            answer: m.content,
          };
        });

      const response = await askResearchQuestion(q.trim(), mode, history);
      setResult(response);
      setStatus('success');

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                status: 'success',
                content: response.answer,
                result: response,
              }
            : msg
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setStatus('error');

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                status: 'error',
                error: message,
              }
            : msg
        )
      );
    }
  }, [query, messages]);

  const reset = useCallback(() => {
    setQuery('');
    setStatus('idle');
    setResult(null);
    setError(null);
    setMessages([]);
  }, []);

  return { query, setQuery, status, result, error, messages, submitQuery, reset };
}
