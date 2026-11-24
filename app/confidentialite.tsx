import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Screen, TopBar } from '../components/ui';
import { PRIVACY_URL } from '../constants/links';
import privacy from '../constants/privacy.json';
import { colors, fonts, radius } from '../constants/theme';

/** Politique de confidentialité, dans l'application (exigée par Google Play, même texte que la page en ligne). */
export default function Confidentialite() {
  const t = privacy.fr;
  return (
    <Screen>
      <TopBar title={t.title} />
      <View style={styles.card}>
        <Text style={styles.muted}>Mise à jour : {privacy.updated}</Text>
        <Text style={styles.body}>{t.intro}</Text>
        {t.sections.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.heading} accessibilityRole="header">{s.title}</Text>
            <Text style={styles.body}>{s.body.replace('{contact}', privacy.contact)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.link} accessibilityRole="link" onPress={() => { Linking.openURL(PRIVACY_URL).catch(() => {}); }}>
        Version en ligne (français et anglais)
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderRadius: radius, padding: 18, gap: 10, marginTop: 4 },
  muted: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  section: { gap: 4, marginTop: 6 },
  heading: { fontFamily: fonts.head, fontSize: 18, lineHeight: 23, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  link: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.link, textDecorationLine: 'underline', textAlign: 'center', marginTop: 18 },
});
