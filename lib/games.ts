import type { Level, Unit, Word } from '../constants/curriculum/types';

export type GameId = 'explore' | 'listen' | 'speak' | 'read' | 'memory' | 'spell' | 'quiz' | 'order';

export const GAMES: Record<GameId, { name: string; desc: string; icon: string; scored: boolean }> = {
  explore: { name: 'Découvrir', desc: 'Touche les cartes pour écouter', icon: '👀', scored: false },
  listen: { name: 'Écoute', desc: 'Écoute et trouve la bonne carte', icon: '🎧', scored: true },
  speak: { name: 'Parle', desc: 'Écoute, répète, et vois ton score', icon: '🎤', scored: true },
  read: { name: 'Le bon mot', desc: 'Trouve le mot anglais', icon: '🔤', scored: true },
  memory: { name: 'Memory', desc: 'Retrouve les paires', icon: '🃏', scored: true },
  spell: { name: 'Épelle', desc: "Remets les lettres dans l'ordre", icon: '🔡', scored: true },
  quiz: { name: 'Quiz', desc: 'Choisis la bonne réponse', icon: '❓', scored: true },
  order: { name: 'Phrases', desc: "Remets les mots dans l'ordre", icon: '🧩', scored: true },
};

/** Les jeux proposés pour une unité, selon son type et ce que l'élève sait déjà faire. */
export function gamesFor(level: Level, unit: Unit): GameId[] {
  const canSpeak = speakPhrases(unit).length >= MIN_SPEAK_PHRASES;
  if (unit.type === 'q') return canSpeak ? ['quiz', 'speak'] : ['quiz'];
  if (unit.type === 'o') return ['order', 'speak'];
  const games: GameId[] = ['explore', 'listen', 'speak'];
  if (level.read) games.push('read');
  games.push('memory');
  if (level.spell) games.push('spell');
  return games;
}

export type SpeakPhrase = { text: string; fr?: string; word?: Word };

export const MIN_SPEAK_PHRASES = 4;

/** Ce que l'élève répète dans le jeu « Parle » : les mots, les phrases, ou les phrases complétées d'un quiz. */
export function speakPhrases(unit: Unit): SpeakPhrase[] {
  if (unit.type === 'v') return unit.words.map((word) => ({ text: word[1], fr: word[2], word }));
  if (unit.type === 'o') return unit.items.map(([text, fr]) => ({ text, fr }));
  const phrases: SpeakPhrase[] = [];
  const seen = new Set<string>();
  for (const [question, answer] of unit.items) {
    const text = spokenSentence(question, answer) ?? answer;
    // Ni chiffres ni dates (la reconnaissance les écrit de dix façons), et pas de réponse trop longue à répéter.
    if (!/^[A-Za-z][A-Za-z ,.'’!?-]*$/.test(text) || text.split(' ').length > 9 || seen.has(text)) continue;
    seen.add(text);
    phrases.push({ text });
  }
  return phrases;
}

export const scoredGames = (level: Level, unit: Unit): GameId[] => gamesFor(level, unit).filter((g) => GAMES[g].scored);

export const isGameId = (g: string | undefined): g is GameId => !!g && g in GAMES;

/** 3 étoiles à partir de 90 % de réussite du premier coup, 2 à partir de 60 %, sinon 1. */
export function starsFor(good: number, total: number): number {
  if (total <= 0) return 1;
  const ratio = good / total;
  return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
}

/** Memory : le nombre d'essais décide des étoiles. */
export function memoryStars(tries: number, pairs: number): number {
  return tries <= pairs + 3 ? 3 : tries <= 2 * pairs + 2 ? 2 : 1;
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** La bonne carte et des intrus pris dans la même unité, dans un ordre aléatoire. */
export function pickOptions(words: readonly Word[], target: Word, count: number): Word[] {
  const others = shuffle(words.filter((w) => w[1] !== target[1])).slice(0, count - 1);
  return shuffle([target, ...others]);
}

/** Mélange les mots d'une phrase, sans jamais redonner l'ordre correct. */
export function scramble(words: readonly string[]): { word: string; key: number }[] {
  const order = shuffle(words.map((word, key) => ({ word, key })));
  if (words.length > 1 && order.every((o, i) => o.key === i)) order.reverse();
  return order;
}

export const isLetter = (ch: string): boolean => /[a-z]/i.test(ch);

/** Texte prononcé après une bonne réponse à une phrase à trou ; null si la question n'est pas une phrase anglaise. */
export function spokenSentence(question: string, answer: string): string | null {
  if (!question.includes('_')) return null;
  const parts = answer.split(' / ');
  let i = 0;
  return question
    .replace(/_+/g, () => parts[Math.min(i++, parts.length - 1)])
    .replace(/\(.*?\)/g, '')
    .replace(/[^\x20-\x7e’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type PictureKind =
  | { kind: 'colour'; colour: string }
  | { kind: 'count'; symbol: string; count: number }
  | { kind: 'number'; text: string }
  | { kind: 'emoji'; text: string }
  | { kind: 'text'; text: string };

/** Comment dessiner un mot : pastille de couleur, quantité à compter, nombre, émoji ou mot français. */
export function pictureOf(word: Word): PictureKind {
  const [img, , fr] = word;
  if (!img) return { kind: 'text', text: fr };
  if (img[0] === '#') return { kind: 'colour', colour: img };
  if (/^\d+$/.test(img)) return { kind: 'number', text: img };
  if (/^⭐+$/.test(img)) return { kind: 'count', symbol: '⭐', count: img.length };
  return { kind: 'emoji', text: img };
}
