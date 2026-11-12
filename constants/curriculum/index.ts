import { COLLEGE } from './college';
import { ELEMENTAIRE } from './elementaire';
import { MATERNELLE } from './maternelle';
import type { Level, Unit } from './types';

export * from './types';

export const LEVELS: Level[] = [...MATERNELLE, ...ELEMENTAIRE, ...COLLEGE];

export const CYCLES = [
  { name: 'Maternelle', sub: "Éveil aux langues · tout à l'oral", icon: '🧸' },
  { name: 'Élémentaire · cycle 2', sub: 'CP, CE1, CE2 · vers le niveau A1', icon: '✏️' },
  { name: 'Cycle 3', sub: 'CM1, CM2, 6e · niveau A1 puis A1+', icon: '🌍' },
  { name: 'Collège · cycle 4', sub: '5e, 4e, 3e · de A2 à B1', icon: '🚀' },
] as const;

export const SOURCES = [
  { scope: 'Maternelle', title: "Guide pour l'éveil à la diversité linguistique en maternelle (Eduscol, 2023)", url: 'https://eduscol.education.fr/document/50921/download' },
  { scope: 'Cycles 2 et 3', title: "Programmes et attendus de fin d'année en langues vivantes (Eduscol)", url: 'https://eduscol.education.fr/164/langues-vivantes-cycles-2-3-et-4' },
  { scope: 'Collège', title: "Programme d'anglais, BO n° 22 du 29 mai 2025, annexe 3", url: 'https://www.education.gouv.fr/sites/default/files/ensel621_annexe3.pdf' },
] as const;

export const findLevel = (id?: string): Level | undefined => LEVELS.find((l) => l.id === id);
export const findUnit = (level: Level | undefined, id?: string): Unit | undefined => level?.units.find((u) => u.id === id);
