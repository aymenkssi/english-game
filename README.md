# Hello English! 🎈

Jeu interactif pour apprendre l'anglais **de la maternelle à la 3e**, aligné sur les programmes officiels de l'Éducation nationale.

## Jouer

Aucune installation : ouvrez `index.html` dans un navigateur (ordinateur, tablette ou téléphone).
Le jeu fonctionne aussi tel quel sur GitHub Pages ou tout hébergement de fichiers statiques.

Les mots sont lus à voix haute par la synthèse vocale du navigateur (voix anglaise). Les étoiles gagnées sont enregistrées sur l'appareil.

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

## Mini-jeux

- **Découvrir** : toucher les cartes pour entendre les mots
- **Écoute** : entendre un mot et trouver la bonne image
- **Le bon mot** : associer l'image au mot écrit (à partir du CP)
- **Memory** : retrouver les paires
- **Épelle** : remettre les lettres dans l'ordre (à partir du CE1)
- **Quiz** : grammaire et culture, avec une explication après chaque réponse
- **Phrases** : remettre les mots dans l'ordre

## Ajouter du contenu

Tout le contenu se trouve dans `js/data-maternelle.js`, `js/data-elementaire.js` et `js/data-college.js` :

```js
V("id", "Titre", "English title", "🎨", [["🐶", "dog", "chien"], …])   // vocabulaire : [image, anglais, français]
Q("id", "Titre", "English title", "❓", [["She ___ a cat.", "has", ["have", "is"], "Explication"], …])
O("id", "Titre", "English title", "🧩", [["I like cats.", "J'aime les chats."], …])
```

## Textes de référence

- Maternelle : [Guide pour l'éveil à la diversité linguistique en maternelle](https://eduscol.education.fr/document/50921/download) (Eduscol, 2023)
- Cycles 2 et 3 : [programmes et attendus de fin d'année en langues vivantes](https://eduscol.education.fr/164/langues-vivantes-cycles-2-3-et-4) (Eduscol)
- Collège : [programme d'anglais, BO n° 22 du 29 mai 2025, annexe 3](https://www.education.gouv.fr/sites/default/files/ensel621_annexe3.pdf)
