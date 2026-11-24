# Consignes pour Claude

- Répondre en français.

## Vérifications avant chaque push

```bash
yarn typecheck && yarn lint && yarn test
python3 play-store/scripts/check_texts.py     # si play-store/textes/ a changé
node play-store/scripts/build-privacy.js      # si constants/privacy.json a changé (régénère docs/)
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
- Jeu « Parle » (`components/games/Speak.tsx`) : `expo-speech-recognition` (micro + service de reconnaissance du
  téléphone, Internet le plus souvent). L'évaluation est dans `lib/speaking.ts` (normalisation, homophones, nombres,
  seuils `GOOD_SCORE` / `ALMOST_SCORE`). C'est une comparaison de texte reconnu, pas une analyse phonétique.
  Publication Google Play : déclarer le micro dans la sécurité des données.
- Suivi d'avancement : `lib/progress.ts` (`nextStep`, `skillStars`, dernière activité dans AsyncStorage `hello-english-last`),
  carte `components/ContinueCard.tsx`, page `app/progression.tsx`.
- Don : `app/soutenir.tsx`, lien PayPal du développeur dans `constants/links.ts` (le même que dans Umrah). Public d'enfants :
  garder la question pour les parents (`lib/parentGate.ts`) devant tout lien de paiement ou lien externe commercial.
- Publication Google Play (textes, images, déclarations, sécurité des données, règles « Familles ») : voir
  `play-store/README.md`. Politique de confidentialité : `constants/privacy.json` (page `app/confidentialite.tsx`
  et `docs/confidentialite.html`, publiée par GitHub Pages).
- `app.json` : la lecture audio en arrière-plan d'expo-audio est désactivée (pas de service de premier plan à déclarer
  à Google) ; ne pas la réactiver.
- R8 est activé (`expo-build-properties` dans `app.json` : `enableMinifyInReleaseBuilds`, `enableShrinkResourcesInReleaseBuilds`).
  Chaque `.aab` a son `mapping.txt` (copié par `build-vps.sh`) à envoyer à Google Play. Après l'ajout d'un module natif,
  essayer l'APK de release sur un téléphone : R8 peut retirer du code utilisé par réflexion
  (règles à ajouter dans `extraProguardRules`).
- Compilation sur le VPS : `./scripts/build-vps.sh setup` (une fois), puis `apk` / `aab` / `all`. Sorties dans
  `~/builds/hello-english/`, clé de signature dans `~/.hello-english/` (hors dépôt, à sauvegarder).
- Avant chaque build envoyé à Google Play : augmenter `android.versionCode` dans `app.json`.
