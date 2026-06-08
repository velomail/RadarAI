'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Run } from '@/lib/types';

type AppNavContextValue = {
  pastRuns: Run[];
  setPastRuns: (runs: Run[]) => void;
  recentOpen: boolean;
  openRecent: () => void;
  closeRecent: () => void;
  toggleRecent: () => void;
};

const AppNavContext = createContext<AppNavContextValue | null>(null);

export function AppNavProvider({ children }: { children: ReactNode }) {
  const [pastRuns, setPastRuns] = useState<Run[]>([]);
  const [recentOpen, setRecentOpen] = useState(false);

  const openRecent = useCallback(() => setRecentOpen(true), []);
  const closeRecent = useCallback(() => setRecentOpen(false), []);
  const toggleRecent = useCallback(() => setRecentOpen((v) => !v), []);

  const value = useMemo(
    () => ({
      pastRuns,
      setPastRuns,
      recentOpen,
      openRecent,
      closeRecent,
      toggleRecent,
    }),
    [pastRuns, recentOpen, openRecent, closeRecent, toggleRecent],
  );

  return <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>;
}

export function useAppNav() {
  const ctx = useContext(AppNavContext);
  if (!ctx) throw new Error('useAppNav must be used within AppNavProvider');
  return ctx;
}

/** Sync server-fetched past runs into client nav (sheet + bottom bar). */
export function PastRunsRegistrar({ runs }: { runs: Run[] }) {
  const { setPastRuns } = useAppNav();
  useEffect(() => {
    setPastRuns(runs);
  }, [runs, setPastRuns]);
  return null;
}
