import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Word } from '../constants/curriculum/types';
import { colors, fonts, radius, type Accent } from '../constants/theme';
import { pictureOf } from '../lib/games';

/** Retour à l'écran précédent, ou à l'accueil si l'application a été ouverte directement sur cet écran. */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill]}>
          <View style={[styles.column, styles.fill]}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

type TileProps = {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  background?: string;
  label?: string;
  children: React.ReactNode;
};

/** Carte blanche « en relief » qui s'enfonce quand on appuie. */
export function Tile({ onPress, disabled, style, borderColor = colors.border, background = colors.surface, label, children }: TileProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.tile,
        { borderColor, backgroundColor: background },
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

type ButtonProps = { title: string; onPress: () => void; accent: Accent; disabled?: boolean; ghost?: boolean; small?: boolean };

export function Button({ title, onPress, accent, disabled, ghost, small }: ButtonProps) {
  const face = disabled ? colors.disabled : ghost ? colors.surface : accent.accent;
  const edge = disabled ? colors.disabledDark : ghost ? colors.border : accent.dark;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: face, borderBottomColor: edge, borderColor: ghost ? colors.border : face },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, small && styles.buttonTextSmall, ghost && { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Text style={styles.iconButtonText}>{icon}</Text>
    </Pressable>
  );
}

export function TopBar({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.topBar}>
      <IconButton icon="←" label="Retour" onPress={goBack} />
      <Text style={styles.topTitle} numberOfLines={2} accessibilityRole="header">{title}</Text>
      <View style={styles.topRight}>{right}</View>
    </View>
  );
}

export function Badge({ text, accent }: { text: string; accent: Accent }) {
  return (
    <View style={[styles.badge, { backgroundColor: accent.accent }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

export function Stars({ count, max = 3, size = 18 }: { count: number; max?: number; size?: number }) {
  return (
    <View style={styles.stars} accessibilityLabel={`${count} étoile${count > 1 ? 's' : ''} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Text key={i} style={{ fontSize: size, lineHeight: size * 1.2, color: i < count ? colors.star : colors.starOff }}>★</Text>
      ))}
    </View>
  );
}

export function ProgressBar({ value, accent, height = 8 }: { value: number; accent: Accent; height?: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={[styles.bar, { height, backgroundColor: accent.soft }]}>
      <View style={{ width: `${pct}%`, height, backgroundColor: accent.accent, borderRadius: 99 }} />
    </View>
  );
}

/** L'image d'un mot : pastille de couleur, étoiles à compter, nombre, émoji, ou mot français s'il n'y a pas d'image. */
export function Picture({ word, size = 64, caption = false }: { word: Word; size?: number; caption?: boolean }) {
  const pic = pictureOf(word);
  const fr = word[2];
  let body: React.ReactNode;
  if (pic.kind === 'colour') {
    body = <View accessibilityLabel={fr} style={{ width: size * 1.1, height: size * 1.1, borderRadius: size, backgroundColor: pic.colour, borderWidth: 4, borderColor: 'rgba(42,35,66,0.16)' }} />;
  } else if (pic.kind === 'count') {
    const star = size * (pic.count > 3 ? 0.38 : 0.46);
    body = (
      <View accessibilityLabel={fr} style={[styles.count, { maxWidth: star * 3.9 }]}>
        {Array.from({ length: pic.count }, (_, i) => <Text key={i} style={emoji(star)}>{pic.symbol}</Text>)}
      </View>
    );
  } else if (pic.kind === 'number') {
    body = <Text style={{ fontFamily: fonts.headBold, fontSize: size * 0.95, lineHeight: size * 1.15, color: colors.text }}>{pic.text}</Text>;
  } else if (pic.kind === 'emoji') {
    body = <Text accessibilityLabel={fr} style={emoji(size)}>{pic.text}</Text>;
  } else {
    const long = pic.text.length > 14;
    return <Text style={[styles.pictureText, { fontSize: Math.max(13, size * (long ? 0.27 : 0.33)) }]}>{pic.text}</Text>;
  }
  if (!caption || pic.kind === 'number') return <>{body}</>;
  return (
    <View style={styles.pictureWrap}>
      {body}
      <Text style={styles.caption}>{fr}</Text>
    </View>
  );
}

// Les émojis ont besoin d'une hauteur de ligne explicite, sinon Android les rogne.
const emoji = (size: number): TextStyle => ({ fontSize: size, lineHeight: size * 1.25, color: colors.text, textAlign: 'center' });

export const text = StyleSheet.create({
  hint: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, textAlign: 'center' },
  word: { fontFamily: fonts.head, fontSize: 21, color: colors.text, textAlign: 'center' },
  caption: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 32, alignItems: 'center' },
  column: { width: '100%', maxWidth: 720 },
  fill: { flex: 1 },
  tile: {
    borderWidth: 2, borderBottomWidth: 6, borderRadius: radius, padding: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  pressed: { transform: [{ translateY: 3 }], opacity: 0.92 },
  button: { borderRadius: 16, borderWidth: 2, borderBottomWidth: 6, paddingVertical: 12, paddingHorizontal: 26, alignItems: 'center', justifyContent: 'center' },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: 16 },
  buttonText: { fontFamily: fonts.head, fontSize: 19, color: colors.white },
  buttonTextSmall: { fontSize: 16 },
  iconButton: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { fontFamily: fonts.headBold, fontSize: 22, lineHeight: 26, color: colors.text },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 10 },
  topTitle: { flex: 1, fontFamily: fonts.head, fontSize: 22, color: colors.text, textAlign: 'center' },
  topRight: { minWidth: 46, alignItems: 'flex-end' },
  badge: { borderRadius: 99, paddingVertical: 4, paddingHorizontal: 12 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.white },
  stars: { flexDirection: 'row', gap: 1 },
  bar: { width: '100%', borderRadius: 99, overflow: 'hidden' },
  count: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  pictureWrap: { alignItems: 'center', gap: 2 },
  pictureText: { fontFamily: fonts.head, color: colors.text, textAlign: 'center', paddingHorizontal: 2 },
  caption: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center' },
});
