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

export const percent = (t: Tally): number => (t.max ? Math.round((100 * t.got) / t.max) : 0);

export const unitDone = (progress: Progress, level: Level, unit: Unit): boolean => {
  const s = unitStars(progress, level, unit);
  return s.max > 0 && s.got === s.max;
};

export const unitsDone = (progress: Progress, level: Level): number => level.units.filter((u) => unitDone(progress, level, u)).length;

/** Dernière activité jouée, pour proposer de reprendre là où l'élève s'est arrêté. */
export type LastPlayed = { level: string; unit: string; game: GameId };

export const LAST_KEY = 'hello-english-last';

export function parseLast(raw: string | null): LastPlayed | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const { level, unit, game } = data as Record<string, unknown>;
    if (typeof level !== 'string' || typeof unit !== 'string' || typeof game !== 'string') return null;
    return { level, unit, game: game as GameId };
  } catch {
    return null;
  }
}

export type NextStep = { unit: Unit; game: GameId };

/** L'activité à faire ensuite dans un niveau : la première unité pas terminée, et son jeu le moins réussi. Null si tout est fait. */
export function nextStep(progress: Progress, level: Level): NextStep | null {
  for (const unit of level.units) {
    const games = scoredGames(level, unit);
    const todo = games.filter((g) => (progress[progressKey(level.id, unit.id, g)] ?? 0) < 3);
    if (todo.length === 0) continue;
    const stars = (g: GameId) => progress[progressKey(level.id, unit.id, g)] ?? 0;
    // Un jeu jamais joué passe avant un jeu à améliorer ; à égalité, on garde l'ordre des jeux.
    const game = todo.reduce((best, g) => (stars(g) < stars(best) ? g : best), todo[0]);
    return { unit, game };
  }
  return null;
}

/** Les compétences travaillées, et les jeux qui les entraînent. */
export const SKILLS: { id: string; name: string; icon: string; games: GameId[] }[] = [
  { id: 'understand', name: 'Comprendre', icon: '👂', games: ['listen', 'read'] },
  { id: 'speak', name: 'Parler', icon: '🎤', games: ['speak'] },
  { id: 'write', name: 'Écrire', icon: '✏️', games: ['spell', 'order'] },
  { id: 'memory', name: 'Mémoriser', icon: '🧠', games: ['memory'] },
  { id: 'knowledge', name: 'Grammaire et culture', icon: '💡', games: ['quiz'] },
];

/** Étoiles par compétence dans un niveau (seulement les compétences proposées à ce niveau). */
export function skillStars(progress: Progress, level: Level): { id: string; name: string; icon: string; got: number; max: number }[] {
  return SKILLS.map((skill) => {
    let got = 0;
    let max = 0;
    for (const unit of level.units) {
      for (const game of scoredGames(level, unit)) {
        if (!skill.games.includes(game)) continue;
        max += 3;
        got += progress[progressKey(level.id, unit.id, game)] ?? 0;
      }
    }
    return { id: skill.id, name: skill.name, icon: skill.icon, got, max };
  }).filter((s) => s.max > 0);
}
