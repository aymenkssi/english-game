import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OrderUnit } from '../../constants/curriculum/types';
import { colors, fonts } from '../../constants/theme';
import { scramble, shuffle, starsFor } from '../../lib/games';
import { playSound } from '../../lib/sounds';
import { say } from '../../lib/speech';
import { Button, text } from '../ui';
import { game, type GameProps } from './shared';

/** Phrases : remettre les mots dans l'ordre. */
export function Order({ unit, accent, onProgress, onFinish }: GameProps<OrderUnit>) {
  const [rounds] = useState(() => shuffle(unit.items).slice(0, 6));
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'bad' | 'ok'>('idle');
  const clean = useRef(true);
  const good = useRef(0);

  const [en, fr] = rounds[index];
  const words = useMemo(() => en.split(' '), [en]);
  const bank = useMemo(() => scramble(words), [words]);

  useEffect(() => onProgress(index / rounds.length), [index, onProgress, rounds.length]);

  const toggle = (key: number) => {
    if (status === 'ok') return;
    setStatus('idle');
    setPlaced((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  };

  const check = () => {
    if (status === 'ok') {
      if (index + 1 < rounds.length) {
        clean.current = true;
        setPlaced([]);
        setStatus('idle');
        setIndex(index + 1);
      } else {
        onProgress(1);
        onFinish(starsFor(good.current, rounds.length), `${good.current} phrase${good.current > 1 ? 's' : ''} sur ${rounds.length} du premier coup`);
      }
      return;
    }
    // On compare le texte, pas les positions : deux mots identiques sont interchangeables.
    if (placed.map((k) => words[k]).join(' ') === en) {
      playSound('good');
      say(en);
      if (clean.current) good.current += 1;
      setStatus('ok');
    } else {
      clean.current = false;
      playSound('bad');
      setStatus('bad');
    }
  };

  const chip = (key: number) => (
    <Pressable key={key} onPress={() => toggle(key)} accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && { transform: [{ translateY: 3 }] }]}>
      <Text style={styles.chipText}>{words[key]}</Text>
    </Pressable>
  );

  return (
    <View style={game.stage}>
      <Text style={text.hint}>Remets les mots dans l&apos;ordre.</Text>
      <View style={game.question}>
        <Text style={[game.questionText, { color: accent.dark }]}>{fr}</Text>
      </View>

      <View style={[styles.line, status === 'bad' && styles.lineBad, status === 'ok' && styles.lineOk]}>
        {placed.map(chip)}
      </View>

      <View style={styles.bank}>
        {bank.filter((b) => !placed.includes(b.key)).map((b) => chip(b.key))}
      </View>

      <Button title={status === 'ok' ? 'Continuer →' : 'Vérifier'} accent={accent} disabled={placed.length < words.length} onPress={check} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    width: '100%', minHeight: 78, flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 10,
    borderWidth: 3, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)',
  },
  lineBad: { borderColor: colors.bad, backgroundColor: colors.badSoft },
  lineOk: { borderStyle: 'solid', borderColor: colors.good, backgroundColor: colors.goodSoft },
  bank: { width: '100%', minHeight: 60, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    height: 48, paddingHorizontal: 12, borderRadius: 14, borderWidth: 3, borderBottomWidth: 6, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  chipText: { fontFamily: fonts.head, fontSize: 18, lineHeight: 24, color: colors.text },
});
