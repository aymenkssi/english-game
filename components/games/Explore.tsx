import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import type { VocabUnit } from '../../constants/curriculum/types';
import { say } from '../../lib/speech';
import { Picture, text, Tile } from '../ui';
import { game, type GameProps } from './shared';

/** Découvrir : on touche une carte pour entendre le mot. Pas de score. */
export function Explore({ level, unit, onProgress }: GameProps<VocabUnit>) {
  useEffect(() => onProgress(1), [onProgress]);
  return (
    <View style={game.stage}>
      <Text style={text.hint}>Touche une carte pour écouter le mot.</Text>
      <View style={game.grid}>
        {unit.words.map((word) => (
          <Tile key={word[1]} style={{ flexBasis: '45%', flexGrow: 1, minHeight: 120, gap: 2 }} label={level.read ? word[1] : word[2]} onPress={() => say(word[1], true)}>
            <Picture word={word} size={56} />
            {level.read ? <Text style={text.word}>{word[1]}</Text> : null}
            {level.read && word[0] ? <Text style={text.caption}>{word[2]}</Text> : null}
          </Tile>
        ))}
      </View>
    </View>
  );
}
