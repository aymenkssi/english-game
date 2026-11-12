# Hello English! 🎈

Application Android pour apprendre l'anglais **de la maternelle à la 3e**, alignée sur les programmes officiels de l'Éducation nationale.

Même base technique que les autres applications (Waselni, AgriPedia, Halal & Mosque Finder) :
**Expo / React Native** (SDK 57, TypeScript, expo-router). L'application fonctionne entièrement hors ligne, sans compte ni serveur.

## Contenu

12 niveaux, 90 unités, environ 900 mots, phrases et questions.

| Niveau | Repère officiel | Contenu |
| --- | --- | --- |
| PS, MS, GS | Éveil à la diversité linguistique | Tout à l'oral : couleurs, nombres, animaux, famille, corps, émotions… |
| CP, CE1, CE2 | Cycle 2, niveau A1 à l'oral | Salutations, classe, famille, maison, jours, mois, météo, premières phrases, fêtes |
| CM1, CM2 | Cycle 3, niveau A1 vers A2 | Journée, heure, description, métiers, itinéraire, grammaire de base, pays anglophones |
| 6e | Niveau A1+, 5 axes | Personnes et personnages ; le quotidien ; pays et paysages ; contes et légendes ; arts et sentiments |
| 5e | Niveau A2, 6 axes | Portrait ; lieux, rythmes, saisons ; école et loisirs ; prétérit, comparatifs ; le Royaume-Uni |
| 4e | Niveau A2+, 6 axes | Sport et société ; voyages et explorations ; villes ; inventer, créer ; present perfect ; l'Irlande |
| 3e | Niveau B1, 6 axes | L'autre et les migrations ; le travail ; médias ; engagement ; passif, conditionnel ; les États-Unis |

Mini-jeux : **Découvrir**, **Écoute**, **Le bon mot** (dès le CP), **Memory**, **Épelle** (dès le CE1), **Quiz** et **Phrases**.
Les mots sont lus par la synthèse vocale du téléphone (voix anglaise) ; les étoiles gagnées sont enregistrées sur l'appareil.

## Développement

```bash
yarn install
yarn start            # Expo (touche a : Android, w : navigateur)
yarn typecheck && yarn lint && yarn test
```

## Construire l'application Android

```bash
npx eas-cli build --platform android --profile preview      # APK à installer directement
npx eas-cli build --platform android --profile production   # .aab pour Google Play
```

Sans EAS, sur une machine qui a le SDK Android :

```bash
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleRelease     # APK dans android/app/build/outputs/apk/release/
```

La CI GitHub Actions (`.github/workflows/ci.yml`) refait les vérifications puis compile l'APK et le publie comme artefact.

## Organisation

- `constants/curriculum/` : tout le contenu pédagogique, un fichier par étape (`maternelle.ts`, `elementaire.ts`, `college.ts`)
- `lib/` : logique sans interface (jeux, scores, progression, voix, sons), testée dans `__tests__/`
- `components/games/` : les mini-jeux ; `app/` : les écrans (expo-router)
- `scripts/` : génération des icônes et des sons

Ajouter du contenu :

```ts
V("id", "Titre", "English title", "🎨", [["🐶", "dog", "chien"], …])   // vocabulaire : [image, anglais, français]
Q("id", "Titre", "English title", "❓", [["She ___ a cat.", "has", ["have", "is"], "Explication"], …])
O("id", "Titre", "English title", "🧩", [["I like cats.", "J'aime les chats."], …])
```

## Textes de référence

- Maternelle : [Guide pour l'éveil à la diversité linguistique en maternelle](https://eduscol.education.fr/document/50921/download) (Eduscol, 2023)
- Cycles 2 et 3 : [programmes et attendus de fin d'année en langues vivantes](https://eduscol.education.fr/164/langues-vivantes-cycles-2-3-et-4) (Eduscol)
- Collège : [programme d'anglais, BO n° 22 du 29 mai 2025, annexe 3](https://www.education.gouv.fr/sites/default/files/ensel621_annexe3.pdf)
