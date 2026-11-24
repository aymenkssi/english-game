import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Screen, TopBar } from '../components/ui';
import { DONATION_URL } from '../constants/links';
import { colors, cycleColors, fonts, radius } from '../constants/theme';
import { checkAnswer, makeChallenge } from '../lib/parentGate';

const accent = cycleColors[0];

export default function Soutenir() {
  const [challenge, setChallenge] = useState(() => makeChallenge());
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const verify = () => {
    if (checkAnswer(answer, challenge)) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setAnswer('');
      setChallenge(makeChallenge());
    }
  };

  const donate = () => {
    Linking.openURL(DONATION_URL).catch(() => {});
  };

  return (
    <Screen>
      <TopBar title="Soutenir l'application" />

      <View style={styles.card}>
        <Text style={styles.heart}>❤️</Text>
        <Text style={styles.title}>Merci d&apos;utiliser Hello English!</Text>
        <Text style={styles.message}>
          L&apos;application est gratuite, sans publicité et sans compte. Si elle aide votre enfant ou vos élèves à progresser en anglais,
          vous pouvez soutenir son développement (nouveaux contenus, nouveaux jeux) par un don.
        </Text>

        {unlocked ? (
          <>
            <Pressable
              onPress={donate}
              accessibilityRole="link"
              style={({ pressed }) => [styles.paypal, pressed && { transform: [{ translateY: 3 }] }]}
            >
              <Text style={styles.paypalText}>Faire un don via PayPal</Text>
            </Pressable>
            <Text style={styles.note}>
              Le don se fait sur le site de PayPal, du montant de votre choix. L&apos;application ne reçoit aucune information de paiement.
            </Text>
          </>
        ) : (
          <View style={styles.gate}>
            <Text style={styles.gateTitle}>👨‍👩‍👧 Réservé aux parents</Text>
            <Text style={styles.gateQuestion}>
              Combien font {challenge.a} × {challenge.b} ?
            </Text>
            <TextInput
              value={answer}
              onChangeText={(v) => { setAnswer(v); setError(false); }}
              onSubmitEditing={verify}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="Réponse"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Réponse à la question pour les parents"
              style={[styles.input, error && { borderColor: colors.bad }]}
            />
            {error ? <Text style={styles.error}>Ce n&apos;est pas la bonne réponse. Voici une autre question.</Text> : null}
            <Button title="Valider" accent={accent} disabled={!answer.trim()} onPress={verify} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.star, borderRadius: radius,
    padding: 20, alignItems: 'center', gap: 12, marginTop: 8,
  },
  heart: { fontSize: 44, lineHeight: 56 },
  title: { fontFamily: fonts.head, fontSize: 22, lineHeight: 28, color: colors.text, textAlign: 'center' },
  message: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.text, textAlign: 'center' },
  gate: { width: '100%', alignItems: 'center', gap: 10, marginTop: 6, paddingTop: 14, borderTopWidth: 2, borderTopColor: colors.border },
  gateTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.muted },
  gateQuestion: { fontFamily: fonts.head, fontSize: 22, color: colors.text },
  input: {
    width: 160, height: 52, borderWidth: 2, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.background,
    textAlign: 'center', fontFamily: fonts.head, fontSize: 22, color: colors.text,
  },
  error: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.bad, textAlign: 'center' },
  paypal: {
    backgroundColor: colors.paypal, borderBottomWidth: 6, borderBottomColor: colors.paypalDark, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 24, marginTop: 6,
  },
  paypalText: { fontFamily: fonts.head, fontSize: 19, color: colors.white },
  note: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center' },
});
