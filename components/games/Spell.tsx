import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { VocabUnit } from '../../constants/curriculum/types';
import { colors, fonts } from '../../constants/theme';
import { isLetter, shuffle, starsFor } from '../../lib/games';
import { playSound } from '../../lib/sounds';
import { say } from '../../lib/speech';
import { Picture, text } from '../ui';
import { game, useLater, type GameProps } from './shared';

/** Position de la prochaine lettre à trouver (on saute espaces, tirets et apostrophes). */
const nextLetter = (word: string, from: number) => {
  let pos = from;
  while (pos < word.length && !isLetter(word[pos])) pos++;
  return pos;
};

/** Épelle : toucher les lettres du mot dans le bon ordre. */
export function Spell({ unit, accent, onProgress, onFinish }: GameProps<VocabUnit>) {
  const [rounds] = useState(() => shuffle(unit.words.filter((w) => w[1].length <= 16)).slice(0, 6));
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(() => nextLetter(rounds[0][1], 0));
  const [used, setUsed] = useState<number[]>([]);
  const [miss, setMiss] = useState<number | null>(null);
  const clean = useRef(true);
  const good = useRef(0);
  const later = useLater();

  const word = rounds[index][1];
  const tiles = useMemo(() => shuffle(word.split('').filter(isLetter)), [word]);
  const done = pos >= word.length;

  useEffect(() => {
    onProgress(index / rounds.length);
    say(word, true);
  }, [index, onProgress, rounds.length, word]);

  const tap = (i: number) => {
    if (done || used.includes(i)) return;
    if (tiles[i].toLowerCase() !== word[pos].toLowerCase()) {
      clean.current = false;
      playSound('bad');
      setMiss(i);
      later(() => setMiss((m) => (m === i ? null : m)), 350);
      return;
    }
    const next = nextLetter(word, pos + 1);
    setUsed([...used, i]);
    setPos(next);
    if (next < word.length) return;
    playSound('good');
    say(word, true);
    if (clean.current) good.current += 1;
    later(() => {
      if (index + 1 < rounds.length) {
        clean.current = true;
        setUsed([]);
        setPos(nextLetter(rounds[index + 1][1], 0));
        setIndex(index + 1);
      } else {
        onProgress(1);
        onFinish(starsFor(good.current, rounds.length), `${good.current} mot${good.current > 1 ? 's' : ''} sur ${rounds.length} sans erreur`);
      }
    }, 1200);
  };

  return (
    <View style={game.stage}>
      <Text style={text.hint}>Touche les lettres dans le bon ordre.</Text>

      <View style={styles.prompt}>
        <Picture word={rounds[index]} size={64} caption />
        <Pressable onPress={() => say(word, true)} accessibilityRole="button" accessibilityLabel="Écouter le mot" style={[styles.listen, { backgroundColor: accent.soft }]}>
          <Text style={styles.listenIcon}>🔊</Text>
        </Pressable>
      </View>

      <View style={styles.slots}>
        {word.split('').map((ch, i) =>
          isLetter(ch) ? (
            <View key={i} style={[styles.slot, i < pos && { borderBottomColor: colors.good }]}>
              <Text style={styles.slotText}>{i < pos ? ch : ' '}</Text>
            </View>
          ) : (
            <Text key={i} style={[styles.slotText, styles.fixed]}>{ch}</Text>
          ),
        )}
      </View>

      <View style={styles.tiles}>
        {tiles.map((ch, i) => (
          <LetterTile key={`${index}-${i}`} letter={ch} used={used.includes(i)} miss={miss === i} onPress={() => tap(i)} />
        ))}
      </View>
    </View>
  );
}

function LetterTile({ letter, used, miss, onPress }: { letter: string; used: boolean; miss: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={used}
      accessibilityRole="button"
      accessibilityLabel={letter}
      style={({ pressed }) => [styles.tile, used && styles.tileUsed, miss && styles.tileMiss, pressed && { transform: [{ translateY: 3 }] }]}
    >
      <Text style={styles.tileText}>{letter}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  prompt: {
    flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 120, paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 26, borderWidth: 3, borderColor: colors.border, backgroundColor: colors.surface,
  },
  listen: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  listenIcon: { fontSize: 22, lineHeight: 28 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  slot: { width: 34, height: 48, borderBottomWidth: 4, borderBottomColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  slotText: { fontFamily: fonts.head, fontSize: 26, lineHeight: 34, color: colors.good },
  fixed: { width: 14, color: colors.text, textAlign: 'center', alignSelf: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  tile: {
    minWidth: 50, height: 56, paddingHorizontal: 12, borderRadius: 14, borderWidth: 3, borderBottomWidth: 6,
    borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  tileUsed: { opacity: 0.25 },
  tileMiss: { borderColor: colors.bad, backgroundColor: colors.badSoft },
  tileText: { fontFamily: fonts.head, fontSize: 24, lineHeight: 30, color: colors.text },
});
