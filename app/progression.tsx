import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ContinueCard } from '../components/ContinueCard';
import { ProgressBar, Screen, Tile, TopBar } from '../components/ui';
import { findLevel, LEVELS } from '../constants/curriculum';
import { colors, cycleColors, fonts, radius } from '../constants/theme';
import { useProgress } from '../contexts/ProgressContext';
import { levelStars, percent, skillStars, unitDone, unitStars, unitsDone } from '../lib/progress';

export default function Progression() {
  const params = useLocalSearchParams<{ level?: string }>();
  const { progress, last, reset } = useProgress();
  const started = LEVELS.find((l) => levelStars(progress, l).got > 0);
  const [selected, setSelected] = useState(() => (findLevel(params.level) ?? findLevel(last?.level) ?? started ?? LEVELS[0]).id);
  const level = findLevel(selected) ?? LEVELS[0];
  const accent = cycleColors[level.cycle];

  const totalStars = LEVELS.reduce((s, l) => s + levelStars(progress, l).got, 0);
  const totalUnits = LEVELS.reduce((s, l) => s + unitsDone(progress, l), 0);
  const levelsStarted = LEVELS.filter((l) => levelStars(progress, l).got > 0).length;

  const askReset = () => {
    const question = 'Effacer toutes les étoiles et la progression enregistrées sur cet appareil ?';
    if (Platform.OS === 'web') {
      if (window.confirm(question)) reset();
      return;
    }
    Alert.alert('Remettre à zéro', question, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <Screen>
      <TopBar title="Ma progression" />

      <View style={styles.summary}>
        <Stat value={`★ ${totalStars}`} label={`étoile${totalStars > 1 ? 's' : ''}`} />
        <Stat value={String(totalUnits)} label={`unité${totalUnits > 1 ? 's' : ''} terminée${totalUnits > 1 ? 's' : ''}`} />
        <Stat value={String(levelsStarted)} label={`niveau${levelsStarted > 1 ? 'x' : ''} commencé${levelsStarted > 1 ? 's' : ''}`} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsWrap}>
        {LEVELS.map((l) => {
          const active = l.id === level.id;
          const a = cycleColors[l.cycle];
          const p = percent(levelStars(progress, l));
          return (
            <Pressable
              key={l.id}
              onPress={() => setSelected(l.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, { borderColor: active ? a.accent : colors.border, backgroundColor: active ? a.accent : colors.surface }]}
            >
              <Text style={[styles.chipText, { color: active ? colors.white : colors.text }]}>{l.short}</Text>
              <Text style={[styles.chipPct, { color: active ? colors.white : colors.muted }]}>{p} %</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ContinueCard level={level} />

      <Text style={styles.section} accessibilityRole="header">Mes compétences</Text>
      <View style={styles.box}>
        {skillStars(progress, level).map((skill) => (
          <View key={skill.id} style={styles.skill}>
            <View style={styles.skillHead}>
              <Text style={styles.skillName}>{skill.icon} {skill.name}</Text>
              <Text style={styles.skillPct}>{percent(skill)} %</Text>
            </View>
            <ProgressBar value={skill.max ? skill.got / skill.max : 0} accent={accent} />
          </View>
        ))}
      </View>

      <Text style={styles.section} accessibilityRole="header">Unités de {level.name}</Text>
      <View style={styles.units}>
        {level.units.map((unit) => {
          const s = unitStars(progress, level, unit);
          const done = unitDone(progress, level, unit);
          return (
            <Tile
              key={unit.id}
              style={styles.unit}
              borderColor={done ? colors.star : undefined}
              onPress={() => router.push(`/level/${level.id}`)}
              label={`${unit.title}, ${s.got} étoiles sur ${s.max}`}
            >
              <Text style={styles.unitIcon}>{done ? '✅' : unit.icon}</Text>
              <View style={styles.unitBody}>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <ProgressBar value={s.max ? s.got / s.max : 0} accent={accent} height={6} />
              </View>
              <Text style={styles.unitStars}>★ {s.got}/{s.max}</Text>
            </Tile>
          );
        })}
      </View>

      <Pressable onPress={askReset} accessibilityRole="button" hitSlop={8} style={styles.reset}>
        <Text style={styles.resetText}>Remettre les étoiles à zéro</Text>
      </Pressable>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderRadius: radius, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center' },
  statValue: { fontFamily: fonts.headBold, fontSize: 24, lineHeight: 30, color: colors.text },
  statLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center' },
  chipsWrap: { marginTop: 16, marginBottom: 12, marginHorizontal: -16 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { borderWidth: 2, borderRadius: 14, paddingVertical: 6, paddingHorizontal: 12, alignItems: 'center', minWidth: 58 },
  chipText: { fontFamily: fonts.headBold, fontSize: 18, lineHeight: 23 },
  chipPct: { fontFamily: fonts.bodyBold, fontSize: 12 },
  section: { fontFamily: fonts.head, fontSize: 20, color: colors.text, marginTop: 22, marginBottom: 10 },
  box: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderRadius: radius, padding: 14, gap: 12 },
  skill: { gap: 6 },
  skillHead: { flexDirection: 'row', justifyContent: 'space-between' },
  skillName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  skillPct: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.muted },
  units: { gap: 10 },
  unit: { flexDirection: 'row', justifyContent: 'flex-start', gap: 12, paddingVertical: 10 },
  unitIcon: { fontSize: 26, lineHeight: 34, width: 34, textAlign: 'center' },
  unitBody: { flex: 1, gap: 6 },
  unitTitle: { fontFamily: fonts.head, fontSize: 16, lineHeight: 20, color: colors.text },
  unitStars: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted },
  reset: { alignSelf: 'center', marginTop: 28 },
  resetText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.muted, textDecorationLine: 'underline' },
});
