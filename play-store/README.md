# Publication sur Google Play · version 1.0.0

Dossier complet pour publier **Hello English!** (`com.aymen.helloenglish`) sur Google Play : textes, images, réponses
aux déclarations de la Play Console et marche à suivre. Même modèle que Waselni et Umrah ; le fichier pour Google Play
(`.aab`) est construit sur le VPS avec `scripts/build-vps.sh`.

| Dossier / fichier | Contenu |
|---|---|
| `textes/fr.md`, `textes/en.md` | Nom, description courte, description complète, notes de version (limites vérifiées par `scripts/check_texts.py` et la CI) |
| `images/icon-512.png` | Icône de la fiche (512 × 512) |
| `images/feature-graphic-fr.png` (`-en`) | Bannière de la fiche (1024 × 500) |
| `images/screenshots-fr/` (`-en`) | 8 captures de téléphone (1080 × 1920) par langue |
| `../docs/confidentialite.html` | Politique de confidentialité en ligne (français et anglais), même texte que dans l'application |
| `scripts/` | Captures, composition des images, politique de confidentialité, contrôle des textes |

Ordre des captures : accueil et « Continuer », page d'un niveau, Découvrir, Parle, quiz avec explication, memory,
« Ma progression », programme officiel.

## Récapitulatif (à copier-coller)

| Élément | Valeur |
|---|---|
| Nom du paquet | `com.aymen.helloenglish` |
| Version / code de version | `1.0.0` / `1` (`app.json` › `expo.version`, `expo.android.versionCode`) |
| Nom sur Google Play | `Hello English! – Anglais école` (fr) · `Hello English! – Kids English` (en) |
| Application ou jeu | **Application** |
| Catégorie | **Éducation** |
| E-mail de contact | `aymenkssi@gmail.com` (affiché publiquement sur la fiche) |
| Site web | `https://aymenkssi.github.io/english-game/` (facultatif) |
| Politique de confidentialité | `https://aymenkssi.github.io/english-game/confidentialite.html` |
| Autorisations | Micro (jeu « Parle », demandé au premier usage), Internet |
| Annonces | Non |
| Achats dans l'application | Non (lien de don PayPal, protégé par une question pour les parents) |
| Public cible | **5 ans et moins, 6-8 ans, 9-12 ans, 13-15 ans** |
| Prix | Gratuit |

## Check-list avant l'envoi

- [ ] La politique de confidentialité s'ouvre en ligne (étape 1).
- [ ] L'APK a été essayé sur un vrai téléphone, **y compris le jeu « Parle »** (micro et reconnaissance vocale).
- [ ] Le fichier `.aab` est construit sur le VPS (étape 2) et la clé `~/.hello-english/` est **sauvegardée**.
- [ ] Compte développeur Google Play actif (frais d'inscription uniques de 25 $, vérification d'identité faite).
- [ ] Le nom de la fiche a été vérifié (voir « Points d'attention » en bas de page).

---

## 1. Mettre en ligne la politique de confidentialité

Google l'exige pour toutes les applications, et en particulier pour celles destinées aux enfants. Le texte est déjà
dans l'application (accueil › **🔒 Confidentialité**) et dans `docs/confidentialite.html`.

**Avec GitHub Pages** (gratuit, dépôt public) :

1. Fusionner la branche de travail dans `main`.
2. GitHub › dépôt `english-game` › **Settings** › **Pages** › *Source* : **Deploy from a branch** › branche `main`,
   dossier **`/docs`** › **Save**.
3. Après une ou deux minutes, vérifier que https://aymenkssi.github.io/english-game/confidentialite.html s'ouvre.

**Ou sur le VPS** : servir le dossier `docs/` sur un sous-domaine (par exemple `hello-english.creationapp.academy`),
puis mettre la nouvelle adresse dans `constants/links.ts` (`PRIVACY_URL`) et dans ce tableau.

Pour modifier la politique : changer `constants/privacy.json`, puis `node play-store/scripts/build-privacy.js`
(un test vérifie que la page en ligne et la page de l'application ont le même texte).

## 2. Construire le fichier pour Google Play (.aab) sur le VPS

```bash
cd english-game
git pull
./scripts/build-vps.sh aab
```

- Le fichier arrive dans `~/builds/hello-english/hello-english-1.0.0-1.aab`. Pour le récupérer :
  `scp utilisateur@vps:builds/hello-english/*.aab .`
- La clé créée au premier build (`~/.hello-english/`) devient la **clé d'importation** : au premier envoi, laisser
  Google Play gérer la clé de signature finale (**Signature d'application Play**, proposé par défaut). Sauvegarder
  `~/.hello-english/` ailleurs que sur le VPS : sans elle, il faut demander une réinitialisation à Google.
- Google Play refuse un code de version déjà envoyé (même en test interne) : **avant chaque nouveau build,
  augmenter `android.versionCode` de 1** dans `app.json`, et `version` (1.0.1, 1.1.0…) quand la version est publiée.

## 3. Créer l'application dans la Play Console

https://play.google.com/console › **Créer une application** :

| Champ | Valeur |
|---|---|
| Nom de l'application | `Hello English! – Anglais école` |
| Langue par défaut | Français – fr-FR |
| Application ou jeu | Application |
| Sans frais ou payante | Sans frais |
| Déclarations | Cocher les règles du programme pour les développeurs et les lois d'exportation des États-Unis |

## 4. Fiche du Store

**Développer la présence sur le Store** › **Fiche principale du Store**.

1. Pour `fr-FR`, puis `en-US` (**Gérer les traductions** › **Ajouter vos propres traductions**) : **Nom**,
   **description courte**, **description complète** depuis `textes/<langue>.md` ; **bannière**
   `images/feature-graphic-<langue>.png` ; **captures de téléphone** : les 8 fichiers de `images/screenshots-<langue>/`,
   dans l'ordre.
2. **Icône** : `images/icon-512.png`.
3. **Paramètres du Store** : catégorie **Éducation** ; tags proposés : « Éducation », « Apprentissage des langues »,
   « Enfants ».
4. **Coordonnées** : e-mail `aymenkssi@gmail.com` ; site `https://aymenkssi.github.io/english-game/` (facultatif).

Les captures pour tablettes sont facultatives.

## 5. Contenu de l'application (déclarations)

**Règles et programmes** › **Contenu de l'application** :

| Rubrique | Réponse |
|---|---|
| Règles de confidentialité | `https://aymenkssi.github.io/english-game/confidentialite.html` |
| Accès à l'application | **Toutes les fonctionnalités sont disponibles sans restriction** (pas de compte) |
| Annonces | **Non, mon application ne contient pas d'annonces** |
| Classification du contenu | Questionnaire › catégorie **Référence, actualités ou éducation** ; **Non** à toutes les questions (violence, peur, contenu sexuel, langage, substances, jeux d'argent, interactions entre utilisateurs, partage de position, achats numériques). Résultat attendu : tous publics (PEGI 3) |
| Public cible et contenu | Tranches d'âge : **5 ans et moins**, **6 à 8 ans**, **9 à 12 ans**, **13 à 15 ans** (voir ci-dessous) |
| Applications d'actualités | Non |
| Fonctionnalités financières | **Mon application ne propose aucune fonctionnalité financière** |
| Santé | Non |
| Applications gouvernementales | Non |
| Sécurité des données | Voir ci-dessous |

### Public cible : règles « Familles »

Comme l'application vise des enfants, elle suit le **Règlement relatif aux familles** de Google Play. Ce qui est déjà
en place :

- Aucune publicité, aucun outil de statistiques, aucun compte, aucune donnée personnelle demandée.
- Pas de localisation, pas de contacts, pas d'appareil photo.
- Le lien de don (PayPal) et le lien en ligne de la politique sont derrière une action volontaire ; le don est en plus
  protégé par une **question pour les parents** (une multiplication).
- Le micro n'est demandé qu'au premier usage du jeu « Parle », avec une explication ; les autres jeux marchent sans.

Questions de la Console : « L'application pourrait-elle attirer les enfants involontairement ? » ne s'applique pas
(elle les vise). Accepter les conditions du programme Familles. L'application peut être proposée au programme
**« Approuvé par des enseignants »** (Teacher Approved) : Google l'évalue automatiquement, rien à envoyer.

### Sécurité des données

L'application elle-même n'envoie rien. Seul le jeu « Parle » transmet la voix au **service de reconnaissance vocale du
téléphone** (Google), qui renvoie le texte reconnu ; l'application ne garde ni la voix ni le texte. Par prudence pour
une application destinée aux enfants, on le **déclare** comme une collecte éphémère :

**Votre application collecte-t-elle ou partage-t-elle des données ?** Oui. **Chiffrées en transit ?** Oui.
**Les utilisateurs peuvent-ils demander la suppression ?** Non : rien n'est conservé (traitement éphémère).

Libellés exacts de la Play Console en anglais (**App content › Data safety › Data types**) :

| Catégorie (Console) | Type à cocher (Console) | Collected / Shared | Processed ephemerally? | Required? | Purposes |
|---|---|---|---|---|---|
| Audio | **Voice or sound recordings** | Collected (pas Shared) | **Yes** | **Optional** (seulement le jeu « Parle ») | App functionality |

À ne **pas** déclarer : nom, e-mail, identifiants, position, identifiants publicitaires, données d'analyse,
informations financières, contacts, photos, fichiers. La progression (étoiles) reste sur l'appareil : elle n'est pas
« collectée » au sens de Google.

**Autorisation du micro** : aucune déclaration spéciale (ce n'est pas une autorisation « sensible » soumise à
formulaire). L'application ne contient **pas** de service de premier plan (la lecture audio en arrière-plan est
désactivée dans `app.json`), donc pas de déclaration « Foreground service » non plus.

## 6. Tester avant la production

1. **Tester et publier** › **Test interne** › **Créer une version** : importer le `.aab`, nom `1.0.0 (1)`,
   notes de version (bloc ci-dessous), ajouter votre Gmail dans les testeurs et installer l'application depuis le lien
   de test. Essayer chaque jeu, dont « Parle » (autoriser le micro).
2. **Comptes personnels récents** : l'accès à la production demande d'abord un **test fermé** avec **au moins
   12 testeurs** inscrits pendant **14 jours d'affilée** (famille, enseignants, parents d'élèves), puis
   **Demander l'accès à la production** (questionnaire sur le test). Vérifier le nombre demandé dans la Console :
   Google le modifie parfois.

```
<fr-FR>
Première version : 12 niveaux de la maternelle à la 3e, 8 jeux dont « Parle » (répéter au micro), suivi de la progression et des compétences.
</fr-FR>
<en-US>
First release: 12 levels from preschool to middle school, 8 games including "Speak" (repeat into the microphone), progress and skills tracking.
</en-US>
```

## 7. Publier en production

**Production** › **Créer une version** (ou **Promouvoir la version** depuis le test fermé) › **Pays et régions** :
France (avec l'outre-mer), Belgique, Suisse, Luxembourg, Canada, Maroc, Algérie, Tunisie, Sénégal, Côte d'Ivoire…
(ou tous les pays : la fiche anglaise précise que l'application suit le programme français) › **Envoyer pour examen**.
L'examen d'une application pour enfants prend souvent plus longtemps : de quelques jours à deux semaines.

## 8. Après la publication

- Répondre aux avis depuis la Play Console (**Notes et avis**).
- Partager le lien Google Play avec les écoles, les enseignants et les associations de parents.
- Pour chaque mise à jour : augmenter `android.versionCode`, `yarn typecheck && yarn lint && yarn test`,
  `./scripts/build-vps.sh aab`, nouvelle version en test interne puis en production, nouvelles notes de version.

## Refaire les images

Après un changement visible de l'application (depuis la racine du dépôt, avec Playwright et Chromium) :

```bash
npx expo export --platform web --output-dir play-store/build/web
npx serve -s -l 3000 play-store/build/web            # dans un autre terminal
node play-store/scripts/capture-screens.js           # captures brutes dans play-store/build/raw/
node play-store/scripts/compose-images.js            # icône, bannières et captures légendées dans images/
python3 play-store/scripts/check_texts.py            # après un changement des textes
```

Les captures utilisent une progression de démonstration et une reconnaissance vocale simulée (aucun micro nécessaire).

## Points d'attention

- **Nom** : une application très connue s'appelle déjà « Hello English: Learn English ». Le nom proposé ajoute
  « Anglais école » / « Kids English » pour éviter la confusion, mais Google peut refuser un nom trop proche d'une
  autre application. En cas de refus, changer le nom de la fiche (et `expo.name` dans `app.json`) : par exemple
  « Hi! Anglais de l'école ».
- **Lien de don** : Google interdit de vendre des contenus numériques hors de Google Play Billing ; un don volontaire,
  sans contrepartie dans l'application, ouvert dans le navigateur, est la même pratique que dans l'application Umrah.
  Ne jamais débloquer de contenu en échange d'un don.
- **Reconnaissance vocale** : elle dépend du service Google du téléphone. Sans ce service ou sans Internet, le jeu
  « Parle » affiche un message et les autres jeux restent utilisables : à mentionner si un examinateur le signale.
