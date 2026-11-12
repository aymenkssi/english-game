import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { VocabUnit, Word } from '../../constants/curriculum/types';
import { colors, fonts } from '../../constants/theme';
import { memoryStars, shuffle } from '../../lib/games';
import { playSound } from '../../lib/sounds';
import { say } from '../../lib/speech';
import { Picture, text } from '../ui';
import { game, useLater, type GameProps } from './shared';

type Card = { pair: number; word: Word; face: 'picture' | 'word' };

/** Memory : deux images identiques avant la lecture, une image et son mot anglais ensuite. */
export function Memory({ level, unit, accent, onProgress, onFinish }: GameProps<VocabUnit>) {
  const [cards] = useState<Card[]>(() => {
    const pairs = shuffle(unit.words).slice(0, level.id === 'ps' ? 4 : 6);
    return shuffle(pairs.flatMap((word, pair): Card[] => [
      { pair, word, face: 'picture' },
      { pair, word, face: level.read ? 'word' : 'picture' },
    ]));
  });
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const tries = useRef(0);
  const later = useLater();
  const pairCount = cards.length / 2;

  const flip = (i: number) => {
    if (open.length >= 2 || open.includes(i) || found.includes(cards[i].pair)) return;
    playSound('flip');
    say(cards[i].word[1], true);
    if (open.length === 0) {
      setOpen([i]);
      return;
    }
    const first = open[0];
    setOpen([first, i]);
    tries.current += 1;
    if (cards[first].pair === cards[i].pair) {
      later(() => {
        playSound('good');
        const nextFound = [...found, cards[i].pair];
        setFound(nextFound);
        setOpen([]);
        onProgress(nextFound.length / pairCount);
        if (nextFound.length === pairCount) {
          later(() => onFinish(memoryStars(tries.current, pairCount), `Toutes les paires en ${tries.current} essais`), 700);
        }
      }, 350);
    } else {
      later(() => setOpen([]), 1000);
    }
  };

  const basis = cards.length > 8 ? '30%' : '22%';

  return (
    <View style={game.stage}>
      <Text style={text.hint}>Retourne deux cartes pour former une paire.</Text>
      <View style={game.grid}>
        {cards.map((card, i) => {
          const isFound = found.includes(card.pair);
          const shown = isFound || open.includes(i);
          return (
            <Pressable
              key={i}
              onPress={() => flip(i)}
              accessibilityRole="button"
              accessibilityLabel={shown ? card.word[level.read ? 1 : 2] : 'Carte retournée'}
              style={[
                styles.card,
                { flexBasis: basis },
                shown
                  ? { backgroundColor: isFound ? colors.goodSoft : colors.surface, borderColor: isFound ? colors.good : colors.border }
                  : { backgroundColor: accent.accent, borderColor: accent.accent, borderBottomColor: accent.dark, borderBottomWidth: 6 },
              ]}
            >
              {!shown ? (
                <Text style={styles.back}>?</Text>
              ) : card.face === 'picture' ? (
                <Picture word={card.word} size={cards.length > 8 ? 46 : 40} />
              ) : (
                <Text style={[text.word, styles.word]} adjustsFontSizeToFit numberOfLines={2}>{card.word[1]}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, aspectRatio: 1, borderRadius: 18, borderWidth: 3, alignItems: 'center', justifyContent: 'center', padding: 4 },
  back: { fontFamily: fonts.headBold, fontSize: 36, color: colors.white },
  word: { fontSize: 17 },
});
