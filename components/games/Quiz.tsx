import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { QuizUnit } from '../../constants/curriculum/types';
import { colors, fonts } from '../../constants/theme';
import { shuffle, spokenSentence, starsFor } from '../../lib/games';
import { playSound } from '../../lib/sounds';
import { say } from '../../lib/speech';
import { Button, Tile } from '../ui';
import { cardColors, game, type GameProps } from './shared';

/** Quiz de grammaire et de culture : une explication s'affiche après la bonne réponse. */
export function Quiz({ unit, accent, onProgress, onFinish }: GameProps<QuizUnit>) {
  const [rounds] = useState(() => shuffle(unit.items).slice(0, 10));
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const good = useRef(0);

  const [question, answer, wrongs, why] = rounds[index];
  const options = useMemo(() => shuffle([answer, ...wrongs]), [answer, wrongs]);

  useEffect(() => onProgress(index / rounds.length), [index, onProgress, rounds.length]);

  const choose = (option: string) => {
    if (solved) return;
    if (option !== answer) {
      playSound('bad');
      setWrong((w) => [...w, option]);
      return;
    }
    playSound('good');
    if (wrong.length === 0) good.current += 1;
    const sentence = spokenSentence(question, answer);
    if (sentence) say(sentence);
    setSolved(true);
  };

  const next = () => {
    if (index + 1 < rounds.length) {
      setIndex(index + 1);
      setWrong([]);
      setSolved(false);
    } else {
      onProgress(1);
      onFinish(starsFor(good.current, rounds.length), `${good.current} sur ${rounds.length} du premier coup`);
    }
  };

  return (
    <View style={game.stage}>
      <View style={game.question}>
        <Text style={game.questionText}>{question}</Text>
      </View>

      <View style={styles.list}>
        {options.map((option) => {
          const state = solved && option === answer ? 'right' : wrong.includes(option) ? 'wrong' : 'idle';
          return (
            <Tile key={option} {...cardColors(state)} disabled={solved || state === 'wrong'} onPress={() => choose(option)} style={[styles.answer, state === 'wrong' && game.wrong]}>
              <Text style={styles.answerText}>{option}</Text>
            </Tile>
          );
        })}
      </View>

      {solved ? (
        <View style={styles.after}>
          <Text style={styles.why}>💡 {why}</Text>
          <Button title="Continuer →" accent={accent} onPress={next} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { width: '100%', gap: 10 },
  answer: { minHeight: 58, paddingHorizontal: 16 },
  answerText: { fontFamily: fonts.head, fontSize: 18, lineHeight: 24, color: colors.text, textAlign: 'center' },
  after: { width: '100%', gap: 14, alignItems: 'center' },
  why: {
    width: '100%', fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 23, color: colors.text,
    backgroundColor: colors.goodSoft, borderRadius: 16, padding: 14, overflow: 'hidden',
  },
});
