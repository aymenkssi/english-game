import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { GameId } from '../lib/games';
import { parseProgress, progressKey, STORAGE_KEY, withStars, type Progress } from '../lib/progress';

type ProgressValue = {
  progress: Progress;
  save: (level: string, unit: string, game: GameId, stars: number) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressValue>({ progress: {}, save: () => {}, reset: () => {} });

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setProgress((current) => ({ ...parseProgress(raw), ...current })))
      .catch(() => {});
  }, []);

  const save = useCallback((level: string, unit: string, game: GameId, stars: number) => {
    setProgress((current) => {
      const next = withStars(current, progressKey(level, unit, game), stars);
      if (next !== current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(() => ({ progress, save, reset }), [progress, save, reset]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export const useProgress = () => useContext(ProgressContext);
