import type { Level, Unit } from '../constants/curriculum/types';
import { scoredGames, type GameId } from './games';

/** Étoiles gagnées, par clé « niveau.unité.jeu ». */
export type Progress = Record<string, number>;

export const STORAGE_KEY = 'hello-english-progress';

export const progressKey = (level: string, unit: string, game: GameId): string => `${level}.${unit}.${game}`;

export function parseProgress(raw: string | null): Progress {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const out: Progress = {};
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'number' && v >= 1 && v <= 3) out[k] = Math.round(v);
    }
    return out;
  } catch {
    return {};
  }
}

/** On ne garde que le meilleur score. */
export function withStars(progress: Progress, key: string, stars: number): Progress {
  return stars > (progress[key] ?? 0) ? { ...progress, [key]: stars } : progress;
}

export type Tally = { got: number; max: number };

export function unitStars(progress: Progress, level: Level, unit: Unit): Tally {
  const games = scoredGames(level, unit);
  return { got: games.reduce((s, g) => s + (progress[progressKey(level.id, unit.id, g)] ?? 0), 0), max: games.length * 3 };
}

export function levelStars(progress: Progress, level: Level): Tally {
  return level.units.reduce<Tally>((acc, u) => {
    const s = unitStars(progress, level, u);
    return { got: acc.got + s.got, max: acc.max + s.max };
  }, { got: 0, max: 0 });
}
