import { useState } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import ChatInterface from './pages/ChatInterface';
import Preloader from './components/Preloader';
import { SearchModeProvider } from '@/context/SearchModeContext';

export type AppView = 'landing' | 'chat';

export interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [sessionKey, setSessionKey] = useState(Date.now());

  const handleNewSession = () => {
    setSessionKey(Date.now());
  };

  const handleAddHistory = (query: string) => {
    setChatHistory(prev => {
      if (prev.length > 0 && prev[0].title === query) return prev;
      return [
        {
          id: Date.now().toString(),
          title: query,
          timestamp: new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
        },
        ...prev
      ];
    });
  };

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {!loading && (
        <SearchModeProvider>
        <DashboardLayout 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onNewSession={handleNewSession}
          chatHistory={chatHistory}
        >
          {currentView === 'landing' ? (
            <LandingPage onStartResearch={() => setCurrentView('chat')} />
          ) : (
            <ChatInterface key={sessionKey} onSearch={handleAddHistory} />
          )}
        </DashboardLayout>
      </SearchModeProvider>
      )}
    </>
  );
}

export default App;
