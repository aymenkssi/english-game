import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import type { Level, Unit } from '../../constants/curriculum/types';
import { colors, fonts, type Accent } from '../../constants/theme';

export type GameProps<U extends Unit = Unit> = {
  level: Level;
  unit: U;
  accent: Accent;
  /** Avancement de la partie, de 0 à 1. */
  onProgress: (value: number) => void;
  onFinish: (stars: number, line: string) => void;
};

/** setTimeout annulé automatiquement quand on quitte l'écran. */
export function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
}

/** Couleurs d'une carte selon son état. */
export function cardColors(state: 'idle' | 'right' | 'wrong') {
  if (state === 'right') return { borderColor: colors.good, background: colors.goodSoft };
  if (state === 'wrong') return { borderColor: colors.bad, background: colors.badSoft };
  return {};
}

export const game = StyleSheet.create({
  stage: { gap: 18, alignItems: 'center', paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', justifyContent: 'center' },
  question: {
    width: '100%', backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.border, borderRadius: 26,
    paddingVertical: 20, paddingHorizontal: 18,
  },
  questionText: { fontFamily: fonts.head, fontSize: 23, lineHeight: 31, color: colors.text, textAlign: 'center' },
  wrong: { opacity: 0.55 },
});
