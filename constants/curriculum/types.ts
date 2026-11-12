/** Un mot : [image, anglais, français]. L'image est un émoji, une couleur (#rrggbb), un nombre, ou vide (on affiche alors le français). */
export type Word = [image: string, en: string, fr: string];
/** Une question : [énoncé, bonne réponse, mauvaises réponses, explication]. */
export type QuizItem = [question: string, answer: string, wrong: string[], why: string];
/** Une phrase à remettre dans l'ordre : [anglais, français]. */
export type Sentence = [en: string, fr: string];

type UnitBase = { id: string; title: string; en: string; icon: string };
export type VocabUnit = UnitBase & { type: 'v'; words: Word[] };
export type QuizUnit = UnitBase & { type: 'q'; items: QuizItem[] };
export type OrderUnit = UnitBase & { type: 'o'; items: Sentence[] };
export type Unit = VocabUnit | QuizUnit | OrderUnit;

export type Level = {
  id: string;
  name: string;
  short: string;
  /** 0 maternelle, 1 cycle 2, 2 cycle 3, 3 cycle 4. */
  cycle: 0 | 1 | 2 | 3;
  cefr: string;
  goal: string;
  /** L'élève sait lire : on peut afficher les mots écrits. */
  read: boolean;
  /** Le jeu « Épelle » est proposé. */
  spell: boolean;
  /** Nombre de cartes proposées dans les jeux de choix. */
  choices: number;
  units: Unit[];
};

export const V = (id: string, title: string, en: string, icon: string, words: Word[]): VocabUnit => ({ id, type: 'v', title, en, icon, words });
export const Q = (id: string, title: string, en: string, icon: string, items: QuizItem[]): QuizUnit => ({ id, type: 'q', title, en, icon, items });
export const O = (id: string, title: string, en: string, icon: string, items: Sentence[]): OrderUnit => ({ id, type: 'o', title, en, icon, items });
