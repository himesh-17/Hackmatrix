import { useState, useCallback, useEffect } from 'react';
import { SearchModeProvider } from './context/SearchModeContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import ChatInterface from './pages/ChatInterface';
import Preloader from './components/Preloader';
import type { ChatMessage, ChatSession } from './types/research';
import {
  loadSessions,
  saveSessions,
  loadCurrentSessionId,
  saveCurrentSessionId,
} from './lib/storage';

export type AppView = 'landing' | 'chat';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    setSessions(loadSessions());
    setCurrentSessionId(loadCurrentSessionId());
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  const handleStartResearch = useCallback(() => {
    const id = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: 'New Research',
      mode: 'research',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(id);
    saveCurrentSessionId(id);
    setCurrentView('chat');
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setCurrentSessionId(id);
    saveCurrentSessionId(id);
    setCurrentView('chat');
  }, []);

  const handleNewSession = useCallback(() => {
    setCurrentSessionId(null);
    saveCurrentSessionId(null);
    setCurrentView('chat');
  }, []);

  const handleUpdateSessionMessages = useCallback(
    (sessionId: string, messages: ChatMessage[], mode: 'casual' | 'research') => {
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const title =
            s.title === 'New Research' && messages.length > 0
              ? messages.find((m) => m.role === 'user')?.content.slice(0, 60) || s.title
              : s.title;
          return { ...s, messages, mode, title };
        });
        saveSessions(updated);
        return updated;
      });
    },
    []
  );

  const handleNavigateHome = useCallback(() => {
    setCurrentView('landing');
  }, []);

  return (
    <SearchModeProvider>
      <DashboardLayout
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNewSession={handleNewSession}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
      >
        {loading && <Preloader onComplete={() => setLoading(false)} />}
        {!loading && currentView === 'landing' && (
          <LandingPage onStartResearch={handleStartResearch} />
        )}
        {!loading && currentView === 'chat' && (
          <ChatInterface
            key={currentSessionId || 'new'}
            session={currentSession}
            onUpdateMessages={handleUpdateSessionMessages}
          />
        )}
      </DashboardLayout>
    </SearchModeProvider>
  );
}

export default App;
