import { router } from 'expo-router';
import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar, Screen, Tile } from '../components/ui';
import { CYCLES, LEVELS } from '../constants/curriculum';
import { colors, cycleColors, fonts } from '../constants/theme';
import { useProgress } from '../contexts/ProgressContext';
import { levelStars } from '../lib/progress';

export default function Home() {
  const { progress, reset } = useProgress();
  const total = LEVELS.reduce((s, l) => s + levelStars(progress, l).got, 0);

  const askReset = () => {
    const question = 'Effacer toutes les étoiles gagnées sur cet appareil ?';
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
      <View style={styles.hero}>
        <Text style={styles.balloon}>🎈</Text>
        <Text style={styles.title} accessibilityRole="header">Hello English!</Text>
        <Text style={styles.tagline}>L&apos;anglais en jouant, de la maternelle à la 3e</Text>
        <View style={styles.total}>
          <Text style={styles.totalStar}>★</Text>
          <Text style={styles.totalText}>{total} étoile{total > 1 ? 's' : ''} gagnée{total > 1 ? 's' : ''}</Text>
        </View>
      </View>

      {CYCLES.map((cycle, i) => {
        const accent = cycleColors[i];
        return (
          <View key={cycle.name} style={styles.cycle}>
            <Text style={[styles.cycleName, { color: accent.dark }]} accessibilityRole="header">{cycle.icon} {cycle.name}</Text>
            <Text style={styles.cycleSub}>{cycle.sub}</Text>
            <View style={styles.levels}>
              {LEVELS.filter((l) => l.cycle === i).map((level) => {
                const stars = levelStars(progress, level);
                return (
                  <Tile key={level.id} style={styles.level} label={`${level.name}, ${stars.got} étoiles sur ${stars.max}`} onPress={() => router.push(`/level/${level.id}`)}>
                    <View style={[styles.short, { backgroundColor: accent.accent }]}>
                      <Text style={styles.shortText}>{level.short}</Text>
                    </View>
                    <Text style={styles.levelName} numberOfLines={2}>{level.name}</Text>
                    <ProgressBar value={stars.max ? stars.got / stars.max : 0} accent={accent} />
                    <Text style={styles.levelCount}>★ {stars.got} / {stars.max}</Text>
                  </Tile>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={styles.footer}>
        <Pressable onPress={() => router.push('/programme')} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.link}>📘 Le programme officiel, niveau par niveau</Text>
        </Pressable>
        <Pressable onPress={askReset} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.link}>Remettre les étoiles à zéro</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 24 },
  balloon: { fontSize: 52, lineHeight: 66 },
  title: { fontFamily: fonts.headBold, fontSize: 44, lineHeight: 52, color: colors.text },
  tagline: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.muted, marginTop: 4, textAlign: 'center' },
  total: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderRadius: 99 },
  totalStar: { fontSize: 18, color: colors.star },
  totalText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  cycle: { marginTop: 26 },
  cycleName: { fontFamily: fonts.head, fontSize: 23 },
  cycleSub: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, marginTop: 2, marginBottom: 12 },
  levels: { flexDirection: 'row', gap: 10 },
  level: { flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start', gap: 6, padding: 10 },
  short: { borderRadius: 14, paddingVertical: 6, paddingHorizontal: 10, minWidth: 54, alignItems: 'center' },
  shortText: { fontFamily: fonts.headBold, fontSize: 24, lineHeight: 30, color: colors.white },
  levelName: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 18, minHeight: 36, color: colors.text },
  levelCount: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  footer: { marginTop: 36, alignItems: 'center', gap: 18 },
  link: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.muted, textDecorationLine: 'underline', textAlign: 'center' },
});
