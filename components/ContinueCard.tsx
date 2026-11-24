import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Level } from '../constants/curriculum';
import { LEVELS } from '../constants/curriculum';
import { colors, cycleColors, fonts } from '../constants/theme';
import { useProgress } from '../contexts/ProgressContext';
import { GAMES } from '../lib/games';
import { levelStars, nextStep, percent, unitsDone } from '../lib/progress';
import { ProgressBar, Tile } from './ui';

/** Carte « Continuer » : où en est l'élève dans son niveau, et l'activité à faire ensuite. */
export function ContinueCard({ level }: { level: Level }) {
  const { progress } = useProgress();
  const accent = cycleColors[level.cycle];
  const stars = levelStars(progress, level);
  const step = nextStep(progress, level);
  const done = unitsDone(progress, level);
  const following = LEVELS[LEVELS.indexOf(level) + 1];

  const open = () => {
    if (step) router.push(`/play/${level.id}/${step.unit.id}/${step.game}`);
    else if (following) router.push(`/level/${following.id}`);
    else router.push(`/level/${level.id}`);
  };

  return (
    <Tile onPress={open} borderColor={accent.accent} style={styles.card} label={step ? `Continuer ${level.name}` : `${level.name} terminé`}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: accent.soft }]}>
          <Text style={styles.iconText}>{step ? step.unit.icon : '🏆'}</Text>
        </View>
        <View style={styles.body}>
          <Text style={[styles.label, { color: accent.dark }]}>
            {level.name} · {step ? (stars.got === 0 ? 'Commence ici' : 'Continuer') : 'Niveau terminé !'}
          </Text>
          <Text style={styles.title}>
            {step ? `${step.unit.title} · ${GAMES[step.game].icon} ${GAMES[step.game].name}` : following ? `Bravo ! Passe à : ${following.name}` : 'Bravo, tu as tout terminé !'}
          </Text>
        </View>
        <Text style={[styles.go, { color: accent.dark }]}>›</Text>
      </View>
      <View style={styles.bar}>
        <ProgressBar value={stars.max ? stars.got / stars.max : 0} accent={accent} height={10} />
      </View>
      <Text style={styles.count}>
        {percent(stars)} % · {done} / {level.units.length} unités terminées · ★ {stars.got} / {stars.max}
      </Text>
    </Tile>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'stretch', paddingHorizontal: 14, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 28, lineHeight: 36 },
  body: { flex: 1 },
  label: { fontFamily: fonts.bodyBold, fontSize: 13 },
  title: { fontFamily: fonts.head, fontSize: 18, lineHeight: 23, color: colors.text },
  go: { fontFamily: fonts.headBold, fontSize: 32, lineHeight: 36 },
  bar: { marginTop: 12 },
  count: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 6 },
});
