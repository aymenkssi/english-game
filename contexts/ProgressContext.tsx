import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { GameId } from '../lib/games';
import { LAST_KEY, parseLast, parseProgress, progressKey, STORAGE_KEY, withStars, type LastPlayed, type Progress } from '../lib/progress';

type ProgressValue = {
  progress: Progress;
  /** Dernière activité ouverte, pour « Continuer ». */
  last: LastPlayed | null;
  save: (level: string, unit: string, game: GameId, stars: number) => void;
  markPlayed: (level: string, unit: string, game: GameId) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressValue>({ progress: {}, last: null, save: () => {}, markPlayed: () => {}, reset: () => {} });

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>({});
  const [last, setLast] = useState<LastPlayed | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEY, LAST_KEY])
      .then(([[, rawProgress], [, rawLast]]) => {
        setProgress((current) => ({ ...parseProgress(rawProgress), ...current }));
        setLast((current) => current ?? parseLast(rawLast));
      })
      .catch(() => {});
  }, []);

  const save = useCallback((level: string, unit: string, game: GameId, stars: number) => {
    setProgress((current) => {
      const next = withStars(current, progressKey(level, unit, game), stars);
      if (next !== current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const markPlayed = useCallback((level: string, unit: string, game: GameId) => {
    const next = { level, unit, game };
    setLast(next);
    AsyncStorage.setItem(LAST_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    setLast(null);
    AsyncStorage.multiRemove([STORAGE_KEY, LAST_KEY]).catch(() => {});
  }, []);

  const value = useMemo(() => ({ progress, last, save, markPlayed, reset }), [progress, last, save, markPlayed, reset]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export const useProgress = () => useContext(ProgressContext);
