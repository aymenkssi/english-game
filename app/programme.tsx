import { router } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Screen, TopBar } from '../components/ui';
import { LEVELS, SOURCES } from '../constants/curriculum';
import { colors, cycleColors, fonts, radius } from '../constants/theme';

export default function Programme() {
  return (
    <Screen>
      <TopBar title="Le programme officiel" />
      <Text style={styles.intro}>
        Chaque niveau du jeu reprend les objectifs, les thèmes et le niveau du Cadre européen (CECRL) fixés par les programmes de l&apos;Éducation nationale.
      </Text>

      <View style={styles.list}>
        {LEVELS.map((level) => {
          const accent = cycleColors[level.cycle];
          return (
            <View key={level.id} style={[styles.card, { borderTopColor: accent.accent }]}>
              <View style={styles.head}>
                <Text style={styles.name} accessibilityRole="header">{level.name}</Text>
                <Badge text={level.cefr} accent={accent} />
              </View>
              <Text style={styles.body}>{level.goal}</Text>
              {level.units.map((unit) => (
                <Text key={unit.id} style={styles.body}>{unit.icon} {unit.title}</Text>
              ))}
              <View style={styles.play}>
                <Button small title="Jouer →" accent={accent} onPress={() => router.push(`/level/${level.id}`)} />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sourcesTitle} accessibilityRole="header">Textes de référence</Text>
      {SOURCES.map((source) => (
        <Text key={source.url} style={styles.source}>
          <Text style={{ fontFamily: fonts.bodyBold }}>{source.scope} : </Text>
          <Text style={styles.link} accessibilityRole="link" onPress={() => { Linking.openURL(source.url).catch(() => {}); }}>{source.title}</Text>
        </Text>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.muted, textAlign: 'center' },
  list: { gap: 14, marginTop: 18 },
  card: { backgroundColor: colors.surface, borderWidth: 2, borderTopWidth: 6, borderColor: colors.border, borderRadius: radius, padding: 16, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  name: { fontFamily: fonts.head, fontSize: 21, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.text },
  play: { alignItems: 'flex-start', marginTop: 10 },
  sourcesTitle: { fontFamily: fonts.head, fontSize: 20, color: colors.text, marginTop: 28, marginBottom: 8 },
  source: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 6 },
  link: { color: colors.link, textDecorationLine: 'underline' },
});
