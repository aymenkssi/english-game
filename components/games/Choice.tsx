import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { VocabUnit } from '../../constants/curriculum/types';
import { colors } from '../../constants/theme';
import { pickOptions, shuffle, starsFor } from '../../lib/games';
import { playSound } from '../../lib/sounds';
import { say } from '../../lib/speech';
import { Picture, text, Tile } from '../ui';
import { cardColors, game, useLater, type GameProps } from './shared';

/** « Écoute » (mot entendu → image) et « Le bon mot » (image → mot écrit). */
export function Choice({ level, unit, accent, onProgress, onFinish, mode }: GameProps<VocabUnit> & { mode: 'listen' | 'read' }) {
  const [rounds] = useState(() => shuffle(unit.words).slice(0, level.cycle === 0 ? 6 : 8));
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const good = useRef(0);
  const later = useLater();

  const target = rounds[index];
  const options = useMemo(() => pickOptions(unit.words, target, level.choices), [unit.words, target, level.choices]);

  useEffect(() => {
    onProgress(index / rounds.length);
    if (mode === 'listen') say(target[1], true);
  }, [index, mode, onProgress, rounds.length, target]);

  const choose = (en: string) => {
    if (solved) return;
    if (en !== target[1]) {
      playSound('bad');
      setWrong((w) => [...w, en]);
      return;
    }
    playSound('good');
    if (wrong.length === 0) good.current += 1;
    if (mode === 'read') say(target[1], true);
    setSolved(true);
    later(() => {
      if (index + 1 < rounds.length) {
        setIndex(index + 1);
        setWrong([]);
        setSolved(false);
      } else {
        onProgress(1);
        onFinish(starsFor(good.current, rounds.length), `${good.current} sur ${rounds.length} du premier coup`);
      }
    }, mode === 'read' ? 1100 : 800);
  };

  const columns = options.length === 3 ? '30%' : '45%';

  return (
    <View style={game.stage}>
      <Text style={text.hint}>{mode === 'listen' ? 'Écoute et touche la bonne carte.' : 'Comment dit-on en anglais ?'}</Text>

      {mode === 'listen' ? (
        <Pressable
          onPress={() => say(target[1], true)}
          accessibilityRole="button"
          accessibilityLabel="Réécouter"
          style={({ pressed }) => [styles.speaker, { backgroundColor: accent.accent, borderBottomColor: accent.dark }, pressed && styles.speakerPressed]}
        >
          <Text style={styles.speakerIcon}>🔊</Text>
        </Pressable>
      ) : (
        <View style={styles.prompt}>
          <Picture word={target} size={72} caption />
        </View>
      )}

      <View style={game.grid}>
        {options.map((option) => {
          const state = solved && option === target ? 'right' : wrong.includes(option[1]) ? 'wrong' : 'idle';
          return (
            <Tile
              key={option[1]}
              {...cardColors(state)}
              disabled={solved || state === 'wrong'}
              onPress={() => choose(option[1])}
              label={mode === 'listen' ? option[2] : option[1]}
              style={[{ flexBasis: columns, flexGrow: 1, minHeight: mode === 'listen' ? 132 : 84 }, state === 'wrong' && game.wrong]}
            >
              {mode === 'listen' ? <Picture word={option} size={options.length === 3 ? 48 : 60} caption={level.read} /> : <Text style={text.word}>{option[1]}</Text>}
            </Tile>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  speaker: { width: 128, height: 128, borderRadius: 64, borderBottomWidth: 7, alignItems: 'center', justifyContent: 'center' },
  speakerPressed: { transform: [{ translateY: 4 }] },
  speakerIcon: { fontSize: 56, lineHeight: 70 },
  prompt: {
    minHeight: 124, minWidth: 180, paddingVertical: 14, paddingHorizontal: 26, borderRadius: 26, borderWidth: 3,
    borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
});
