/** Évaluation de la prononciation : on compare ce que la reconnaissance vocale a entendu avec le texte attendu. */

const UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** Les reconnaissances vocales écrivent souvent « 3 » pour « three ». */
export function numberWords(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > 100) return null;
  if (n < 20) return UNITS[n];
  if (n === 100) return 'one hundred';
  const unit = n % 10;
  return TENS[Math.floor(n / 10)] + (unit ? ' ' + UNITS[unit] : '');
}

// Mots qui se prononcent pareil : sans contexte, la reconnaissance peut choisir l'un ou l'autre.
const HOMOPHONES: Record<string, string> = {
  too: 'two', to: 'two', for: 'four', fore: 'four', ate: 'eight', won: 'one', read: 'red', blew: 'blue', son: 'sun',
  see: 'sea', i: 'eye', be: 'bee', hare: 'hair', pair: 'pear', bare: 'bear', night: 'knight', which: 'witch',
  flour: 'flower', know: 'no', write: 'right', board: 'bored', here: 'hear', there: 'their', wear: 'where',
  deer: 'dear', male: 'mail', meet: 'meat', piece: 'peace', weak: 'week', tail: 'tale', hi: 'high', by: 'buy',
  bye: 'buy', our: 'hour', nose: 'knows', toes: 'tows', maths: 'math', mum: 'mom', mummy: 'mommy', grey: 'gray',
  colour: 'color', favourite: 'favorite', neighbour: 'neighbor', neighbourhood: 'neighborhood', centre: 'center',
};

/** Minuscules, sans ponctuation, contractions développées, nombres en lettres, homophones ramenés à une seule forme. */
export function normalizeSpeech(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\bcan't\b/g, 'can not')
    .replace(/\bcannot\b/g, 'can not')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'ve\b/g, ' have')
    .replace(/'ll\b/g, ' will')
    .replace(/'d\b/g, ' would')
    .replace(/'s\b/g, ' is')
    .replace(/\bo'clock\b/g, 'oclock')
    .replace(/\d+/g, (digits) => numberWords(Number(digits)) ?? digits)
    .replace(/[^a-z0-9 ]+/g, ' ');
  return cleaned.split(' ').filter(Boolean).map((word) => HOMOPHONES[word] ?? word);
}

/** Distance d'édition entre deux suites (lettres ou mots). */
export function editDistance<T>(a: readonly T[], b: readonly T[]): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

const ratio = <T,>(a: readonly T[], b: readonly T[]): number => {
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 0 : 1 - editDistance(a, b) / longest;
};

/** Ressemblance de 0 à 1 entre le texte attendu et un texte entendu. */
export function similarity(expected: string, heard: string): number {
  const want = normalizeSpeech(expected);
  const got = normalizeSpeech(heard);
  if (want.length === 0 || got.length === 0) return 0;
  // Mot à mot, puis lettre à lettre sans les espaces (« ice cream » / « icecream », « T-shirt » / « tshirt »).
  const byWords = ratio(want, got);
  const byLetters = ratio(want.join('').split(''), got.join('').split(''));
  return Math.max(byWords, byLetters);
}

export type Verdict = 'good' | 'almost' | 'retry';

export const GOOD_SCORE = 0.8;
export const ALMOST_SCORE = 0.45;

/** Garde la meilleure des propositions de la reconnaissance vocale. */
export function evaluateSpeech(expected: string, heard: readonly string[]): { score: number; heard: string; verdict: Verdict } {
  let best = { score: 0, heard: heard[0] ?? '' };
  for (const candidate of heard) {
    const score = similarity(expected, candidate);
    if (score > best.score) best = { score, heard: candidate };
  }
  const verdict: Verdict = best.score >= GOOD_SCORE ? 'good' : best.score >= ALMOST_SCORE ? 'almost' : 'retry';
  return { ...best, verdict };
}
