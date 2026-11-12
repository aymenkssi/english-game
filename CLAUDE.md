# Consignes pour Claude

- Répondre en français.

## Vérifications avant chaque push

```bash
yarn typecheck && yarn lint && yarn test
npx expo export --platform web                # tous les écrans se construisent
```

La CI GitHub Actions (`ci.yml`) refait ces vérifications puis compile l'APK Android (`expo prebuild` + Gradle).

## Points d'attention

- Application Android **Hello English!**, même structure que Waselni, AgriPedia et Halal & Mosque Finder :
  **Expo / React Native** (SDK 57, TypeScript, expo-router). APK et .aab :
  `npx eas-cli build --platform android --profile preview` (APK) / `--profile production` (.aab).
- Pas de serveur ni de compte : tout le contenu est embarqué, la progression est dans AsyncStorage (`contexts/ProgressContext.tsx`).
- Contenu pédagogique : `constants/curriculum/` (un fichier par étape). Il suit les programmes officiels ;
  au collège, chaque unité culturelle reprend un axe du BO n° 22 du 29 mai 2025. Les tests vérifient sa cohérence
  (mots distincts dans une unité, aucune lecture demandée en maternelle, une seule bonne réponse par question).
- La logique sans interface va dans `lib/` avec ses tests Jest (`__tests__/`).
- Maternelle (`read: false`) : aucun mot écrit à lire, chaque mot a une image.
- Pas de `Intl` ni de `String.normalize` (moteur Hermes).
- Émojis : toujours une `lineHeight` explicite, sinon Android les rogne (`components/ui.tsx`).
- Voix : `lib/speech.ts` (expo-speech, voix du téléphone). Sons : `lib/sounds.ts` (expo-audio), fichiers générés par
  `node scripts/make-sounds.js`. Icônes : `node scripts/make-icons.js <chemin vers playwright>`.
- Avant chaque build envoyé à Google Play : augmenter `android.versionCode` dans `app.json`.
