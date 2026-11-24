import { LEVELS } from '../constants/curriculum';
import { checkAnswer, makeChallenge } from '../lib/parentGate';
import { nextStep, parseLast, percent, skillStars, unitDone, unitsDone } from '../lib/progress';

const level = (id: string) => LEVELS.find((l) => l.id === id)!;

describe('nextStep', () => {
  it('starts with the first game of the first unit', () => {
    const cp = level('cp');
    expect(nextStep({}, cp)).toEqual({ unit: cp.units[0], game: 'listen' });
  });

  it('prefers a game never played to one to improve, then moves to the next unit', () => {
    const cp = level('cp');
    const first = cp.units[0].id;
    expect(nextStep({ [`cp.${first}.listen`]: 2 }, cp)?.game).toBe('speak');
    expect(nextStep({ [`cp.${first}.listen`]: 2, [`cp.${first}.speak`]: 3, [`cp.${first}.read`]: 1, [`cp.${first}.memory`]: 3 }, cp)?.game).toBe('read');
    const done = { [`cp.${first}.listen`]: 3, [`cp.${first}.speak`]: 3, [`cp.${first}.read`]: 3, [`cp.${first}.memory`]: 3 };
    expect(unitDone(done, cp, cp.units[0])).toBe(true);
    expect(nextStep(done, cp)?.unit).toBe(cp.units[1]);
  });

  it('returns null once every game of the level has three stars', () => {
    const ps = level('ps');
    const all: Record<string, number> = {};
    for (const u of ps.units) for (const g of ['listen', 'speak', 'memory']) all[`ps.${u.id}.${g}`] = 3;
    expect(nextStep(all, ps)).toBeNull();
    expect(unitsDone(all, ps)).toBe(ps.units.length);
  });
});

describe('skillStars', () => {
  it('only lists the skills a level trains', () => {
    expect(skillStars({}, level('ps')).map((s) => s.id)).toEqual(['understand', 'speak', 'memory']);
    expect(skillStars({}, level('ce1')).map((s) => s.id)).toEqual(['understand', 'speak', 'write', 'memory', 'knowledge']);
  });

  it('adds up the stars of the games behind each skill', () => {
    const ps = level('ps');
    const colours = skillStars({ 'ps.colours.listen': 3, 'ps.colours.speak': 1 }, ps);
    expect(colours.find((s) => s.id === 'understand')).toMatchObject({ got: 3, max: ps.units.length * 3 });
    expect(colours.find((s) => s.id === 'speak')).toMatchObject({ got: 1 });
  });
});

describe('percent', () => {
  it('rounds and handles empty tallies', () => {
    expect(percent({ got: 1, max: 3 })).toBe(33);
    expect(percent({ got: 0, max: 0 })).toBe(0);
  });
});

describe('parseLast', () => {
  it('reads a saved activity and ignores damaged data', () => {
    expect(parseLast('{"level":"ce1","unit":"days","game":"listen"}')).toEqual({ level: 'ce1', unit: 'days', game: 'listen' });
    expect(parseLast(null)).toBeNull();
    expect(parseLast('oops')).toBeNull();
    expect(parseLast('{"level":1}')).toBeNull();
  });
});

describe('parent gate', () => {
  it('asks a multiplication and checks the answer', () => {
    const c = makeChallenge(() => 0);
    expect(c).toEqual({ a: 12, b: 3, answer: 36 });
    expect(checkAnswer(' 36 ', c)).toBe(true);
    expect(checkAnswer('35', c)).toBe(false);
    expect(checkAnswer('3a6', c)).toBe(false);
    expect(checkAnswer('', c)).toBe(false);
    const hard = makeChallenge(() => 0.999);
    expect(hard).toEqual({ a: 39, b: 9, answer: 351 });
  });
});
