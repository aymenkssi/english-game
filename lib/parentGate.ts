/** Question pour les parents avant d'ouvrir un lien de paiement : une multiplication qu'un jeune enfant ne fait pas de tête. */
export type ParentChallenge = { a: number; b: number; answer: number };

export function makeChallenge(random: () => number = Math.random): ParentChallenge {
  const a = 12 + Math.floor(random() * 28); // de 12 à 39
  const b = 3 + Math.floor(random() * 7); // de 3 à 9
  return { a, b, answer: a * b };
}

export function checkAnswer(input: string, challenge: ParentChallenge): boolean {
  const digits = input.replace(/\s+/g, '');
  return /^\d+$/.test(digits) && Number(digits) === challenge.answer;
}
