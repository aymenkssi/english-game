import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Screen, Tile, TopBar } from '../../components/ui';
import { findLevel } from '../../constants/curriculum';
import { colors, cycleColors, fonts } from '../../constants/theme';
import { useProgress } from '../../contexts/ProgressContext';
import { gamesFor } from '../../lib/games';
import { levelStars, unitStars } from '../../lib/progress';

export default function LevelScreen() {
  const params = useLocalSearchParams<{ level: string }>();
  const { progress } = useProgress();
  const level = findLevel(params.level);
  if (!level) return <Redirect href="/" />;

  const accent = cycleColors[level.cycle];
  const total = levelStars(progress, level);

  return (
    <Screen>
      <TopBar title={level.name} right={<Badge text={level.cefr} accent={accent} />} />
      <Text style={styles.goal}>{level.goal}</Text>
      <Text style={styles.total}><Text style={{ color: colors.star }}>★</Text> {total.got} / {total.max}</Text>

      <View style={styles.units}>
        {level.units.map((unit) => {
          const stars = unitStars(progress, level, unit);
          const games = gamesFor(level, unit);
          const done = stars.got === stars.max;
          // Une unité à un seul jeu s'ouvre directement sur ce jeu.
          const target = games.length === 1 ? `/play/${level.id}/${unit.id}/${games[0]}` : `/unit/${level.id}/${unit.id}`;
          return (
            <Tile key={unit.id} style={styles.unit} borderColor={done ? colors.star : undefined} onPress={() => router.push(target)}>
              <View style={[styles.icon, { backgroundColor: accent.soft }]}>
                <Text style={styles.iconText}>{unit.icon}</Text>
              </View>
              <View style={styles.unitText}>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.unitSub}>{unit.en}</Text>
              </View>
              <Text style={[styles.unitStars, done && { color: '#B77F00' }]}>★ {stars.got}/{stars.max}</Text>
            </Tile>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  goal: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center' },
  total: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.text, textAlign: 'center', marginTop: 10 },
  units: { gap: 12, marginTop: 18 },
  unit: { flexDirection: 'row', justifyContent: 'flex-start', gap: 14, paddingHorizontal: 14 },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 30, lineHeight: 38 },
  unitText: { flex: 1 },
  unitTitle: { fontFamily: fonts.head, fontSize: 18, lineHeight: 22, color: colors.text },
  unitSub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  unitStars: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.muted },
});
