/* Maternelle — éveil à la diversité linguistique (programme 2021, guide Eduscol 2023).
   Tout est oral : l'enfant écoute, montre, associe. Aucun mot écrit n'est requis.
   Format d'un mot : [image, anglais, français]. Une image commençant par # est une couleur. */
import { V, type Level } from './types';

export const MATERNELLE: Level[] = [
  {
    id: "ps", name: "Petite section", short: "PS", cycle: 0, cefr: "Éveil", read: false, spell: false, choices: 3,
    goal: "Éveil à la diversité linguistique : écouter les sonorités de l'anglais, reconnaître quelques mots très familiers à l'oral.",
    units: [
      V("colours", "Les couleurs", "Colours", "🎨", [
        ["#e53935", "red", "rouge"], ["#1e88e5", "blue", "bleu"], ["#fdd835", "yellow", "jaune"], ["#43a047", "green", "vert"],
      ]),
      V("animals", "Les animaux", "Animals", "🐶", [
        ["🐱", "cat", "chat"], ["🐶", "dog", "chien"], ["🐟", "fish", "poisson"], ["🐦", "bird", "oiseau"],
        ["🦆", "duck", "canard"], ["🐮", "cow", "vache"],
      ]),
      V("numbers", "Je compte jusqu'à 5", "Numbers 1–5", "🖐️", [
        ["⭐", "one", "un"], ["⭐⭐", "two", "deux"], ["⭐⭐⭐", "three", "trois"], ["⭐⭐⭐⭐", "four", "quatre"],
        ["⭐⭐⭐⭐⭐", "five", "cinq"],
      ]),
      V("toys", "Les jouets", "Toys", "🧸", [
        ["⚽", "ball", "ballon"], ["🧸", "teddy bear", "nounours"], ["🚗", "car", "voiture"], ["📕", "book", "livre"],
        ["🎈", "balloon", "ballon de baudruche"], ["🤖", "robot", "robot"],
      ]),
      V("fruits", "Les fruits", "Fruit", "🍎", [
        ["🍎", "apple", "pomme"], ["🍌", "banana", "banane"], ["🍊", "orange", "orange"], ["🍓", "strawberry", "fraise"],
      ]),
    ],
  },
  {
    id: "ms", name: "Moyenne section", short: "MS", cycle: 0, cefr: "Éveil", read: false, spell: false, choices: 4,
    goal: "Éveil à la diversité linguistique : mémoriser des mots de comptines (couleurs, nombres, animaux, famille) et les reconnaître à l'oral.",
    units: [
      V("colours", "Toutes les couleurs", "Colours", "🌈", [
        ["#e53935", "red", "rouge"], ["#1e88e5", "blue", "bleu"], ["#fdd835", "yellow", "jaune"], ["#43a047", "green", "vert"],
        ["#fb8c00", "orange", "orange"], ["#f48fb1", "pink", "rose"], ["#8e24aa", "purple", "violet"], ["#212121", "black", "noir"],
        ["#ffffff", "white", "blanc"], ["#795548", "brown", "marron"],
      ]),
      V("numbers", "Je compte jusqu'à 10", "Numbers 1–10", "🔢", [
        ["1", "one", "un"], ["2", "two", "deux"], ["3", "three", "trois"], ["4", "four", "quatre"], ["5", "five", "cinq"],
        ["6", "six", "six"], ["7", "seven", "sept"], ["8", "eight", "huit"], ["9", "nine", "neuf"], ["10", "ten", "dix"],
      ]),
      V("farm", "Les animaux de la ferme", "Farm animals", "🐷", [
        ["🐷", "pig", "cochon"], ["🐴", "horse", "cheval"], ["🐑", "sheep", "mouton"], ["🐔", "hen", "poule"],
        ["🐰", "rabbit", "lapin"], ["🐭", "mouse", "souris"], ["🐸", "frog", "grenouille"], ["🐝", "bee", "abeille"],
      ]),
      V("food", "À table !", "Food", "🍞", [
        ["🍞", "bread", "pain"], ["🥛", "milk", "lait"], ["🧀", "cheese", "fromage"], ["🥚", "egg", "œuf"],
        ["🍰", "cake", "gâteau"], ["💧", "water", "eau"], ["🍦", "ice cream", "glace"], ["🥕", "carrot", "carotte"],
      ]),
      V("family", "La famille", "Family", "👨‍👩‍👧", [
        ["👩", "mummy", "maman"], ["👨", "daddy", "papa"], ["👶", "baby", "bébé"], ["👵", "grandma", "mamie"],
        ["👴", "grandpa", "papi"], ["👦", "boy", "garçon"], ["👧", "girl", "fille"],
      ]),
      V("weather", "La météo", "Weather", "☀️", [
        ["☀️", "sun", "soleil"], ["🌧️", "rain", "pluie"], ["❄️", "snow", "neige"], ["🌬️", "wind", "vent"],
        ["☁️", "cloud", "nuage"], ["🌈", "rainbow", "arc-en-ciel"],
      ]),
    ],
  },
  {
    id: "gs", name: "Grande section", short: "GS", cycle: 0, cefr: "Éveil", read: false, spell: false, choices: 4,
    goal: "Éveil à la diversité linguistique : comprendre des mots et consignes simples à l'oral (corps, émotions, actions) pour préparer l'entrée au CP.",
    units: [
      V("body", "Mon corps", "My body", "🖐️", [
        ["👁️", "eye", "œil"], ["👃", "nose", "nez"], ["👄", "mouth", "bouche"], ["👂", "ear", "oreille"],
        ["✋", "hand", "main"], ["🦶", "foot", "pied"], ["🦵", "leg", "jambe"], ["💪", "arm", "bras"], ["🦷", "tooth", "dent"],
      ]),
      V("feelings", "Les émotions", "Feelings", "😀", [
        ["😀", "happy", "content"], ["😢", "sad", "triste"], ["😠", "angry", "en colère"], ["😴", "sleepy", "endormi"],
        ["😱", "scared", "effrayé"], ["😲", "surprised", "surpris"], ["🤒", "sick", "malade"],
      ]),
      V("wild", "Les animaux sauvages", "Wild animals", "🦁", [
        ["🦁", "lion", "lion"], ["🐘", "elephant", "éléphant"], ["🐵", "monkey", "singe"], ["🐯", "tiger", "tigre"],
        ["🦒", "giraffe", "girafe"], ["🦓", "zebra", "zèbre"], ["🐍", "snake", "serpent"], ["🐻", "bear", "ours"],
        ["🐊", "crocodile", "crocodile"], ["🐧", "penguin", "manchot"],
      ]),
      V("clothes", "Les vêtements", "Clothes", "👕", [
        ["👕", "T-shirt", "tee-shirt"], ["👖", "trousers", "pantalon"], ["👗", "dress", "robe"], ["👟", "shoes", "chaussures"],
        ["🧢", "cap", "casquette"], ["🧦", "socks", "chaussettes"], ["🧥", "coat", "manteau"], ["🧣", "scarf", "écharpe"],
        ["🧤", "gloves", "gants"],
      ]),
      V("actions", "Je bouge !", "Actions", "🏃", [
        ["🏃", "run", "courir"], ["🏊", "swim", "nager"], ["💃", "dance", "danser"], ["🎤", "sing", "chanter"],
        ["👏", "clap", "applaudir"], ["🛌", "sleep", "dormir"], ["🚶", "walk", "marcher"], ["😭", "cry", "pleurer"],
      ]),
      V("transport", "Les transports", "Transport", "🚌", [
        ["🚗", "car", "voiture"], ["🚌", "bus", "bus"], ["🚆", "train", "train"], ["✈️", "plane", "avion"],
        ["⛵", "boat", "bateau"], ["🚲", "bike", "vélo"], ["🚀", "rocket", "fusée"], ["🚜", "tractor", "tracteur"],
      ]),
    ],
  }
];
