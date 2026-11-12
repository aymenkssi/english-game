import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme';
import { shuffle, speakPhrases, starsFor } from '../../lib/games';
import { playSound } from '../../lib/sounds';
import { evaluateSpeech, type Verdict } from '../../lib/speaking';
import { hush, say } from '../../lib/speech';
import { Button, goBack, Picture, text } from '../ui';
import { game, useLater, type GameProps } from './shared';

const MAX_TRIES = 3;

type Phase = 'idle' | 'listening' | 'good' | 'almost' | 'retry' | 'silent' | 'offline' | 'blocked';

const FEEDBACK: Record<Exclude<Phase, 'idle' | 'listening' | 'blocked'>, { face: string; line: string }> = {
  good: { face: '🤩', line: 'Bravo, très bien prononcé !' },
  almost: { face: '🙂', line: 'Presque ! Écoute encore et réessaie.' },
  retry: { face: '🤔', line: "Ce n'est pas encore ça. Écoute bien et réessaie." },
  silent: { face: '🙉', line: "Je n'ai rien entendu. Parle un peu plus fort." },
  offline: { face: '📡', line: 'La reconnaissance vocale a besoin d’Internet. Vérifie la connexion.' },
};

/** Parle : l'élève écoute, répète au micro, et l'application compare ce qu'elle a entendu avec le modèle. */
export function Speak({ level, unit, accent, onProgress, onFinish }: GameProps) {
  const [rounds] = useState(() => shuffle(speakPhrases(unit)).slice(0, level.cycle === 0 ? 5 : 6));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(() => {
    try {
      return ExpoSpeechRecognitionModule.isRecognitionAvailable() ? 'idle' : 'blocked';
    } catch {
      return 'blocked';
    }
  });
  const [heard, setHeard] = useState('');
  const [tries, setTries] = useState(0);
  const good = useRef(0);
  const answered = useRef(false);
  const lang = useRef('en-GB');
  const later = useLater();

  const phrase = rounds[index];
  const target = phrase.text;

  useEffect(() => {
    onProgress(index / rounds.length);
    say(target, true);
  }, [index, onProgress, rounds.length, target]);

  // On libère le micro en quittant l'écran.
  useEffect(() => () => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // Rien à arrêter.
    }
  }, []);

  const next = () => {
    if (index + 1 < rounds.length) {
      setIndex(index + 1);
      setTries(0);
      setHeard('');
      setPhase('idle');
    } else {
      onProgress(1);
      onFinish(starsFor(good.current, rounds.length), `${good.current} sur ${rounds.length} bien prononcé${good.current > 1 ? 's' : ''}`);
    }
  };

  const judge = (verdict: Verdict, transcript: string) => {
    answered.current = true;
    setHeard(transcript);
    setTries((t) => t + 1);
    setPhase(verdict);
    if (verdict === 'good') {
      good.current += 1;
      playSound('good');
      later(next, 1400);
    } else {
      playSound('bad');
    }
  };

  const begin = () => {
    try {
      ExpoSpeechRecognitionModule.start({
        lang: lang.current,
        interimResults: false,
        maxAlternatives: 5,
        continuous: false,
        // Aide la reconnaissance à choisir le mot attendu parmi des mots voisins.
        contextualStrings: [target],
      });
    } catch {
      setPhase('blocked');
    }
  };

  const listen = async () => {
    if (phase === 'listening' || phase === 'good') return;
    hush();
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setPhase('blocked');
        return;
      }
    } catch {
      setPhase('blocked');
      return;
    }
    answered.current = false;
    setHeard('');
    setPhase('listening');
    begin();
  };

  useSpeechRecognitionEvent('result', (event) => {
    if (!event.isFinal || answered.current) return;
    const result = evaluateSpeech(target, event.results.map((r) => r.transcript));
    judge(result.verdict, result.heard);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (answered.current || event.error === 'aborted') return;
    if (event.error === 'language-not-supported' && lang.current === 'en-GB') {
      // Certains téléphones n'ont que l'anglais américain.
      lang.current = 'en-US';
      begin();
      return;
    }
    answered.current = true;
    if (event.error === 'no-speech' || event.error === 'speech-timeout') setPhase('silent');
    else if (event.error === 'network') setPhase('offline');
    else setPhase('blocked');
  });

  useSpeechRecognitionEvent('end', () => {
    if (!answered.current) setPhase((p) => (p === 'listening' ? 'silent' : p));
  });

  if (phase === 'blocked') {
    return (
      <View style={game.stage}>
        <Text style={styles.face}>🎤</Text>
        <Text style={styles.blockedTitle}>Le micro n&apos;est pas disponible</Text>
        <Text style={text.hint}>
          Ce jeu a besoin du micro et de la reconnaissance vocale du téléphone (application Google). Autorise le micro dans les réglages, puis réessaie.
        </Text>
        <Button title="Retour" accent={accent} onPress={goBack} />
      </View>
    );
  }

  const listening = phase === 'listening';
  const feedback = phase === 'idle' || listening ? null : FEEDBACK[phase];
  const failed = tries >= MAX_TRIES && phase !== 'good';

  return (
    <View style={game.stage}>
      <Text style={text.hint}>Écoute, puis répète en anglais.</Text>

      <Pressable onPress={() => say(target, true)} accessibilityRole="button" accessibilityLabel="Réécouter" style={styles.model}>
        {phrase.word ? <Picture word={phrase.word} size={72} /> : null}
        {level.read ? <Text style={styles.target}>{target}</Text> : null}
        {level.read && phrase.fr && (!phrase.word || phrase.word[0]) ? <Text style={text.caption}>{phrase.fr}</Text> : null}
        <View style={[styles.replay, { backgroundColor: accent.soft }]}>
          <Text style={styles.replayIcon}>🔊</Text>
          <Text style={[styles.replayText, { color: accent.dark }]}>Écouter</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={listen}
        disabled={listening || phase === 'good' || failed}
        accessibilityRole="button"
        accessibilityLabel={listening ? "Je t'écoute" : 'Parler'}
        style={({ pressed }) => [
          styles.mic,
          { backgroundColor: listening ? colors.bad : accent.accent, borderBottomColor: listening ? '#B93238' : accent.dark },
          (phase === 'good' || failed) && styles.micOff,
          pressed && { transform: [{ translateY: 4 }] },
        ]}
      >
        <Text style={styles.micIcon}>{listening ? '👂' : '🎤'}</Text>
      </Pressable>
      <Text style={styles.micLabel}>{listening ? "Je t'écoute…" : tries === 0 ? 'Touche le micro et parle' : `Essai ${Math.min(tries + 1, MAX_TRIES)} sur ${MAX_TRIES}`}</Text>

      {feedback ? (
        <View style={[styles.feedback, { backgroundColor: phase === 'good' ? colors.goodSoft : phase === 'almost' ? colors.notice : colors.badSoft }]}>
          <Text style={styles.face}>{feedback.face}</Text>
          <Text style={styles.feedbackLine}>{failed ? 'On continue, tu y arriveras la prochaine fois !' : feedback.line}</Text>
          {level.read && heard ? <Text style={styles.heard}>J&apos;ai entendu : « {heard} »</Text> : null}
        </View>
      ) : null}

      {failed ? <Button title="Continuer →" accent={accent} onPress={next} /> : null}
      {!failed && tries > 0 && phase !== 'good' && !listening ? (
        <Pressable onPress={next} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.skip}>Passer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  model: {
    width: '100%', alignItems: 'center', gap: 6, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 26,
    borderWidth: 3, borderColor: colors.border, backgroundColor: colors.surface,
  },
  target: { fontFamily: fonts.head, fontSize: 26, lineHeight: 34, color: colors.text, textAlign: 'center' },
  replay: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 14, marginTop: 4 },
  replayIcon: { fontSize: 18, lineHeight: 24 },
  replayText: { fontFamily: fonts.bodyBold, fontSize: 15 },
  mic: { width: 116, height: 116, borderRadius: 58, borderBottomWidth: 7, alignItems: 'center', justifyContent: 'center' },
  micOff: { opacity: 0.35 },
  micIcon: { fontSize: 50, lineHeight: 64 },
  micLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.muted, textAlign: 'center', marginTop: -6 },
  feedback: { width: '100%', alignItems: 'center', gap: 4, borderRadius: 18, padding: 14 },
  face: { fontSize: 40, lineHeight: 52 },
  feedbackLine: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 24, color: colors.text, textAlign: 'center' },
  heard: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, textAlign: 'center' },
  blockedTitle: { fontFamily: fonts.head, fontSize: 22, color: colors.text, textAlign: 'center' },
  skip: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.muted, textDecorationLine: 'underline' },
});
