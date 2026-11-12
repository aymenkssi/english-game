// Génère les petits sons du jeu (assets/sounds/*.wav) : notes sinusoïdales, sans fichier source.
// Usage : node scripts/make-sounds.js
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const DIR = path.join(__dirname, '..', 'assets', 'sounds');

function wav(notes) {
  const samples = [];
  for (const [freq, seconds] of notes) {
    const n = Math.round(seconds * RATE);
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      const envelope = Math.min(1, i / 60) * Math.exp((-4 * i) / n);
      samples.push(Math.sin(2 * Math.PI * freq * t) * envelope * 0.6);
    }
  }
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(s * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const SOUNDS = {
  good: [[660, 0.1], [880, 0.16]],
  bad: [[220, 0.22]],
  win: [[523, 0.13], [659, 0.13], [784, 0.13], [1047, 0.3]],
  flip: [[440, 0.06]],
};

fs.mkdirSync(DIR, { recursive: true });
for (const [name, notes] of Object.entries(SOUNDS)) {
  fs.writeFileSync(path.join(DIR, `${name}.wav`), wav(notes));
  console.log(`assets/sounds/${name}.wav`);
}
