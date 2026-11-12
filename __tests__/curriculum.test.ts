import { LEVELS } from '../constants/curriculum';
import { gamesFor, pictureOf } from '../lib/games';

describe('curriculum', () => {
  it('covers every class from petite section to troisième, in order', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(['ps', 'ms', 'gs', 'cp', 'ce1', 'ce2', 'cm1', 'cm2', '6e', '5e', '4e', '3e']);
    expect(LEVELS.map((l) => l.cycle)).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });

  it('has unique unit ids inside each level', () => {
    for (const level of LEVELS) {
      const ids = level.units.map((u) => u.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  describe.each(LEVELS.map((l) => [l.id, l] as const))('%s', (_id, level) => {
    it('has vocabulary that can be told apart on a card', () => {
      for (const unit of level.units) {
        if (unit.type !== 'v') continue;
        const english = unit.words.map((w) => w[1]);
        const faces = unit.words.map((w) => w[0] || w[2]);
        expect(new Set(english).size).toBe(english.length);
        expect(new Set(faces).size).toBe(faces.length);
        // Assez de mots pour proposer des intrus et former les paires du memory.
        expect(unit.words.length).toBeGreaterThanOrEqual(Math.max(level.choices, 4));
      }
    });

    it('never asks a child who cannot read to read', () => {
      if (level.read) return;
      for (const unit of level.units) {
        expect(unit.type).toBe('v');
        if (unit.type !== 'v') continue;
        for (const word of unit.words) expect(pictureOf(word).kind).not.toBe('text');
        expect(gamesFor(level, unit)).toEqual(['explore', 'listen', 'memory']);
      }
    });

    it('has quiz questions with one right answer and distinct wrong ones', () => {
      for (const unit of level.units) {
        if (unit.type !== 'q') continue;
        expect(unit.items.length).toBeGreaterThanOrEqual(6);
        for (const [question, answer, wrong, why] of unit.items) {
          expect(question && answer && why).toBeTruthy();
          expect(wrong.length).toBeGreaterThanOrEqual(2);
          expect(new Set([answer, ...wrong]).size).toBe(wrong.length + 1);
        }
      }
    });

    it('has sentences of at least two words with a translation', () => {
      for (const unit of level.units) {
        if (unit.type !== 'o') continue;
        for (const [en, fr] of unit.items) {
          expect(en.split(' ').length).toBeGreaterThanOrEqual(2);
          expect(en).toBe(en.trim().replace(/\s+/g, ' '));
          expect(fr).toBeTruthy();
        }
      }
    });
  });
});
