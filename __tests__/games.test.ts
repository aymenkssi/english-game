import { LEVELS } from '../constants/curriculum';
import type { Word } from '../constants/curriculum';
import { gamesFor, memoryStars, pickOptions, pictureOf, scramble, spokenSentence, starsFor } from '../lib/games';
import { levelStars, parseProgress, progressKey, unitStars, withStars } from '../lib/progress';

const level = (id: string) => LEVELS.find((l) => l.id === id)!;

describe('gamesFor', () => {
  it('offers reading from CP and spelling from CE1', () => {
    expect(gamesFor(level('cp'), level('cp').units[1])).toEqual(['explore', 'listen', 'read', 'memory']);
    expect(gamesFor(level('ce1'), level('ce1').units[0])).toEqual(['explore', 'listen', 'read', 'memory', 'spell']);
  });

  it('gives quiz and sentence units a single game', () => {
    const ce1 = level('ce1');
    expect(gamesFor(ce1, ce1.units.find((u) => u.type === 'q')!)).toEqual(['quiz']);
    expect(gamesFor(ce1, ce1.units.find((u) => u.type === 'o')!)).toEqual(['order']);
  });
});

describe('scores', () => {
  it('turns first-try answers into stars', () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(9, 10)).toBe(3);
    expect(starsFor(6, 10)).toBe(2);
    expect(starsFor(5, 10)).toBe(1);
    expect(starsFor(0, 0)).toBe(1);
  });

  it('rewards a memory game finished in few tries', () => {
    expect(memoryStars(6, 6)).toBe(3);
    expect(memoryStars(9, 6)).toBe(3);
    expect(memoryStars(14, 6)).toBe(2);
    expect(memoryStars(15, 6)).toBe(1);
  });
});

describe('pickOptions', () => {
  const words: Word[] = [['🐱', 'cat', 'chat'], ['🐶', 'dog', 'chien'], ['🐟', 'fish', 'poisson'], ['🐦', 'bird', 'oiseau'], ['🦆', 'duck', 'canard']];

  it('always includes the target, without duplicates', () => {
    for (let i = 0; i < 50; i++) {
      const options = pickOptions(words, words[2], 4);
      expect(options).toHaveLength(4);
      expect(options).toContain(words[2]);
      expect(new Set(options.map((o) => o[1])).size).toBe(4);
    }
  });
});

describe('scramble', () => {
  it('keeps every word and never returns the right order', () => {
    const words = 'I like cats.'.split(' ');
    for (let i = 0; i < 50; i++) {
      const out = scramble(words);
      expect(out.map((o) => o.word).sort()).toEqual([...words].sort());
      expect(out.map((o) => o.key)).not.toEqual([0, 1, 2]);
    }
  });
});

describe('spokenSentence', () => {
  it('fills the gap and drops hints and emojis', () => {
    expect(spokenSentence('She ___ my friend.', 'is')).toBe('She is my friend.');
    expect(spokenSentence('I ___ never ___ to Ireland.', 'have / been')).toBe('I have never been to Ireland.');
    expect(spokenSentence('The cat is ___ the bed. (dessous)', 'under')).toBe('The cat is under the bed.');
  });

  it('says nothing when the question is not a sentence to complete', () => {
    expect(spokenSentence('Quelle est la capitale du Royaume-Uni ?', 'London')).toBeNull();
  });
});

describe('pictureOf', () => {
  it('recognises colours, quantities, numbers, emojis and plain words', () => {
    expect(pictureOf(['#e53935', 'red', 'rouge'])).toEqual({ kind: 'colour', colour: '#e53935' });
    expect(pictureOf(['⭐⭐⭐', 'three', 'trois'])).toEqual({ kind: 'count', symbol: '⭐', count: 3 });
    expect(pictureOf(['12', 'twelve', 'douze'])).toEqual({ kind: 'number', text: '12' });
    expect(pictureOf(['🐶', 'dog', 'chien'])).toEqual({ kind: 'emoji', text: '🐶' });
    expect(pictureOf(['', 'Monday', 'lundi'])).toEqual({ kind: 'text', text: 'lundi' });
  });
});

describe('progress', () => {
  it('keeps only the best score', () => {
    const key = progressKey('cp', 'pets', 'listen');
    const once = withStars({}, key, 2);
    expect(once).toEqual({ 'cp.pets.listen': 2 });
    expect(withStars(once, key, 1)).toBe(once);
    expect(withStars(once, key, 3)).toEqual({ 'cp.pets.listen': 3 });
  });

  it('ignores damaged saved data', () => {
    expect(parseProgress(null)).toEqual({});
    expect(parseProgress('not json')).toEqual({});
    expect(parseProgress('[1,2]')).toEqual({});
    expect(parseProgress('{"a.b.quiz":3,"x":"y","z":9}')).toEqual({ 'a.b.quiz': 3 });
  });

  it('adds up stars per unit and per level', () => {
    const cp = level('cp');
    const pets = cp.units.find((u) => u.id === 'pets')!;
    const progress = { 'cp.pets.listen': 3, 'cp.pets.read': 2, 'cp.sentences.order': 1 };
    expect(unitStars(progress, cp, pets)).toEqual({ got: 5, max: 9 });
    expect(levelStars(progress, cp).got).toBe(6);
  });
});
