import { createContext, useContext, type ReactNode, useState } from 'react';

export type SearchMode = 'casual' | 'research';

interface SearchModeContextProps {
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
}

const SearchModeContext = createContext<SearchModeContextProps | undefined>(undefined);

export const SearchModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<SearchMode>('research');
  return (
    <SearchModeContext.Provider value={{ mode, setMode }}>
      {children}
    </SearchModeContext.Provider>
  );
};

export const useSearchMode = () => {
  const context = useContext(SearchModeContext);
  if (!context) {
    throw new Error('useSearchMode must be used within a SearchModeProvider');
  }
  return context;
};
