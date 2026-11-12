import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  good: require('../assets/sounds/good.wav'),
  bad: require('../assets/sounds/bad.wav'),
  win: require('../assets/sounds/win.wav'),
  flip: require('../assets/sounds/flip.wav'),
};

export type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

/** Petits sons de jeu. Une erreur audio ne doit jamais bloquer une partie. */
export function playSound(name: SoundName): void {
  try {
    const player = (players[name] ??= createAudioPlayer(SOURCES[name]));
    player.volume = 0.5;
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Pas de son : on continue.
  }
}
