import * as Speech from 'expo-speech';

/** Lit un mot ou une phrase en anglais avec la voix du téléphone. */
export function say(text: string, slow = false): void {
  try {
    Speech.stop();
    Speech.speak(text, { language: 'en-GB', rate: slow ? 0.75 : 0.9 });
  } catch {
    // Pas de synthèse vocale sur cet appareil : le jeu reste jouable.
  }
}

export function hush(): void {
  try {
    Speech.stop();
  } catch {
    // Rien à arrêter.
  }
}
