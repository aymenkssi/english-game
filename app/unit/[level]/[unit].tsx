import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, Stars, Tile, TopBar } from '../../../components/ui';
import { findLevel, findUnit } from '../../../constants/curriculum';
import { colors, cycleColors, fonts } from '../../../constants/theme';
import { useProgress } from '../../../contexts/ProgressContext';
import { GAMES, gamesFor } from '../../../lib/games';
import { progressKey } from '../../../lib/progress';

export default function UnitScreen() {
  const params = useLocalSearchParams<{ level: string; unit: string }>();
  const { progress } = useProgress();
  const level = findLevel(params.level);
  const unit = findUnit(level, params.unit);
  if (!level || !unit) return <Redirect href="/" />;

  const accent = cycleColors[level.cycle];

  return (
    <Screen>
      <TopBar title={unit.title} />
      <Text style={styles.sub}>{unit.icon} {unit.en}</Text>
      <View style={styles.games}>
        {gamesFor(level, unit).map((game) => (
          <Tile key={game} style={styles.game} onPress={() => router.push(`/play/${level.id}/${unit.id}/${game}`)}>
            <View style={[styles.icon, { backgroundColor: accent.soft }]}>
              <Text style={styles.iconText}>{GAMES[game].icon}</Text>
            </View>
            <View style={styles.gameText}>
              <Text style={styles.gameName}>{GAMES[game].name}</Text>
              <Text style={styles.gameDesc}>{GAMES[game].desc}</Text>
            </View>
            {GAMES[game].scored ? <Stars count={progress[progressKey(level.id, unit.id, game)] ?? 0} /> : null}
          </Tile>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, textAlign: 'center' },
  games: { gap: 12, marginTop: 18 },
  game: { flexDirection: 'row', justifyContent: 'flex-start', gap: 14, paddingHorizontal: 14 },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 30, lineHeight: 38 },
  gameText: { flex: 1 },
  gameName: { fontFamily: fonts.head, fontSize: 18, color: colors.text },
  gameDesc: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
});
