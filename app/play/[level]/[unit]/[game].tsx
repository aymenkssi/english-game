import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Choice } from '../../../../components/games/Choice';
import { Explore } from '../../../../components/games/Explore';
import { Memory } from '../../../../components/games/Memory';
import { Order } from '../../../../components/games/Order';
import { Quiz } from '../../../../components/games/Quiz';
import { Spell } from '../../../../components/games/Spell';
import { Button, goBack, IconButton, ProgressBar, Screen, Stars } from '../../../../components/ui';
import { findLevel, findUnit, type Level, type Unit } from '../../../../constants/curriculum';
import { colors, cycleColors, fonts } from '../../../../constants/theme';
import { useProgress } from '../../../../contexts/ProgressContext';
import { GAMES, gamesFor, isGameId, type GameId } from '../../../../lib/games';
import { playSound } from '../../../../lib/sounds';
import { hush } from '../../../../lib/speech';

const CHEERS = ['Continue !', 'Bien joué !', 'Bravo !', 'Parfait !'];

export default function PlayScreen() {
  const params = useLocalSearchParams<{ level: string; unit: string; game: string }>();
  const level = findLevel(params.level);
  const unit = findUnit(level, params.unit);
  const gameId = isGameId(params.game) ? params.game : undefined;
  if (!level || !unit || !gameId || !gamesFor(level, unit).includes(gameId)) return <Redirect href="/" />;
  return <Play level={level} unit={unit} gameId={gameId} />;
}

function Play({ level, unit, gameId }: { level: Level; unit: Unit; gameId: GameId }) {
  const { save } = useProgress();
  const [value, setValue] = useState(0);
  const [result, setResult] = useState<{ stars: number; line: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  // On coupe la voix en quittant l'écran.
  useEffect(() => hush, []);

  const finish = useCallback((stars: number, line: string) => {
    save(level.id, unit.id, gameId, stars);
    playSound('win');
    setResult({ stars, line });
  }, [level.id, unit.id, gameId, save]);

  const accent = cycleColors[level.cycle];
  const common = { level, accent, onProgress: setValue, onFinish: finish };

  const replay = () => {
    setResult(null);
    setValue(0);
    setAttempt((a) => a + 1);
  };

  let board: React.ReactNode = null;
  if (unit.type === 'q') board = <Quiz key={attempt} unit={unit} {...common} />;
  else if (unit.type === 'o') board = <Order key={attempt} unit={unit} {...common} />;
  else if (gameId === 'explore') board = <Explore key={attempt} unit={unit} {...common} />;
  else if (gameId === 'memory') board = <Memory key={attempt} unit={unit} {...common} />;
  else if (gameId === 'spell') board = <Spell key={attempt} unit={unit} {...common} />;
  else if (gameId === 'listen' || gameId === 'read') board = <Choice key={attempt} unit={unit} mode={gameId} {...common} />;

  return (
    <Screen>
      <View style={styles.bar}>
        <IconButton icon="✕" label="Quitter" onPress={goBack} />
        <View style={styles.progress}>
          <ProgressBar value={value} accent={accent} height={14} />
        </View>
        <Text style={styles.tag}>{GAMES[gameId].icon}</Text>
      </View>

      {result ? (
        <View style={styles.result}>
          <Stars count={result.stars} size={68} />
          <Text style={styles.cheer} accessibilityRole="header">{CHEERS[result.stars]}</Text>
          <Text style={styles.line}>{result.line}</Text>
          <View style={styles.row}>
            <Button ghost title="↻ Rejouer" accent={accent} onPress={replay} />
            <Button title="Continuer →" accent={accent} onPress={goBack} />
          </View>
        </View>
      ) : (
        board
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 10 },
  progress: { flex: 1 },
  tag: { fontSize: 24, lineHeight: 32 },
  result: { alignItems: 'center', gap: 14, paddingVertical: 36 },
  cheer: { fontFamily: fonts.headBold, fontSize: 38, color: colors.text },
  line: { fontFamily: fonts.body, fontSize: 17, color: colors.muted, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
});
