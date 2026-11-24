/**
 * Images de la fiche Google Play de Hello English! :
 *  - images/icon-512.png (512 x 512, depuis assets/images/icon.png)
 *  - images/feature-graphic-<langue>.png (1024 x 500)
 *  - images/screenshots-<langue>/*.png (1080 x 1920) : captures de build/raw/ (capture-screens.js) avec une légende
 *
 * Depuis la racine du dépôt : node play-store/scripts/compose-images.js [chemin vers playwright]
 */
const fs = require('fs');
const path = require('path');

const { chromium } = require(process.argv[2] || 'playwright');
const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..');
const OUT = path.join(ROOT, 'images');
const RAW = path.join(ROOT, 'build', 'raw');

const ttf = (pkg, dir, file) => fs.readFileSync(path.join(REPO, 'node_modules', '@expo-google-fonts', pkg, dir, file)).toString('base64');
const FONTS = `
@font-face{font-family:Fredoka;font-weight:700;src:url(data:font/ttf;base64,${ttf('fredoka', '700Bold', 'Fredoka_700Bold.ttf')})}
@font-face{font-family:Fredoka;font-weight:600;src:url(data:font/ttf;base64,${ttf('fredoka', '600SemiBold', 'Fredoka_600SemiBold.ttf')})}
@font-face{font-family:Nunito;font-weight:700;src:url(data:font/ttf;base64,${ttf('nunito', '700Bold', 'Nunito_700Bold.ttf')})}`;
const png = (file) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;

const ORANGE = '#FF8A3D', ORANGE_DARK = '#D96A1F', CREAM = '#FFF7E8', INK = '#2A2342', WHITE = '#FFFFFF';
const BG = `radial-gradient(800px 600px at 100% 0%,#FFB36B 0%,transparent 60%),radial-gradient(700px 700px at 0% 100%,#FF6F2B 0%,transparent 60%),linear-gradient(160deg,#FFA559 0%,${ORANGE} 55%,#FF7A2B 100%)`;

const TEXT = {
  fr: { tagline: 'L\'anglais en jouant,\nde la maternelle à la 3e', chips: ['12 niveaux', '8 jeux', 'Programmes officiels', 'Sans publicité'] },
  en: { tagline: 'English through play,\nfrom preschool to age 15', chips: ['12 levels', '8 games', 'School curriculum', 'No ads'] },
};

// Même ordre que capture-screens.js.
const CAPTIONS = {
  fr: [
    'L\'anglais de la maternelle à la 3e',
    'Le programme officiel, classe par classe',
    'Écoute et découvre les mots',
    'Parle : l\'appli écoute ta prononciation',
    'Une explication après chaque réponse',
    'Memory, épelle, phrases : 8 jeux',
    'Suis ta progression et tes compétences',
    'Conforme aux programmes de l\'Éducation nationale',
  ],
  en: [
    'English from preschool to age 15',
    'The school curriculum, level by level',
    'Listen and discover words',
    'Speak: the app listens to you',
    'An explanation after every answer',
    'Memory, spelling, sentences: 8 games',
    'Track progress and skills',
    'Follows the French national curriculum',
  ],
};

const page = (body, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;font-family:Fredoka,Nunito,sans-serif;-webkit-font-smoothing:antialiased}
</style></head><body>${body}</body></html>`;

// La bulle « Hi! » de l'icône, en HTML pour rester nette à toutes les tailles.
const bubble = (size) => `
  <div style="position:relative;width:${size}px;height:${size * 0.74}px;background:${WHITE};border-radius:${size * 0.2}px;display:flex;align-items:center;justify-content:center;font:700 ${size * 0.46}px Fredoka;color:${INK};box-shadow:0 18px 40px rgba(120,40,0,.25)">
    Hi<span style="color:${ORANGE}">!</span>
    <div style="position:absolute;left:${size * 0.16}px;bottom:${-size * 0.17}px;border-left:${size * 0.2}px solid ${WHITE};border-bottom:${size * 0.2}px solid transparent"></div>
  </div>`;

(async () => {
  const browser = await chromium.launch();
  const shot = async (html, w, h, file) => {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(html, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await p.screenshot({ path: file });
    await p.close();
    console.log('play-store/' + path.relative(ROOT, file));
  };

  await shot(page(`<img src="${png(path.join(REPO, 'assets', 'images', 'icon.png'))}" style="width:512px;height:512px;display:block">`, 512, 512),
    512, 512, path.join(OUT, 'icon-512.png'));

  for (const [lang, t] of Object.entries(TEXT)) {
    const chips = t.chips.map((c) => `<span style="background:rgba(255,255,255,.95);color:${ORANGE_DARK};border-radius:999px;padding:8px 18px;font:700 21px Nunito">${c}</span>`).join('');
    await shot(page(`
      <div style="width:1024px;height:500px;background:${BG};display:flex;align-items:center;gap:56px;padding:0 64px;color:${WHITE}">
        <div style="flex:0 0 300px;display:flex;justify-content:center;margin-bottom:30px">${bubble(290)}</div>
        <div style="flex:1">
          <div style="font:700 62px/1.05 Fredoka;text-shadow:0 3px 0 rgba(160,60,0,.25)">Hello English!</div>
          <div style="font:600 32px/1.25 Fredoka;margin-top:14px;white-space:pre-line">${t.tagline}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:26px">${chips}</div>
        </div>
      </div>`, 1024, 500), 1024, 500, path.join(OUT, `feature-graphic-${lang}.png`));
  }

  if (!fs.existsSync(RAW)) throw new Error('Pas de captures dans play-store/build/raw : lancez d\'abord capture-screens.js');
  const files = fs.readdirSync(RAW).filter((f) => f.endsWith('.png')).sort();
  for (const lang of Object.keys(TEXT)) {
    for (const [i, f] of files.entries()) {
      await shot(page(`
        <div style="width:1080px;height:1920px;background:${BG};display:flex;flex-direction:column;align-items:center;padding-top:80px">
          <div style="color:${WHITE};font:700 66px/1.2 Fredoka;text-align:center;text-wrap:balance;padding:0 80px;height:240px;display:flex;align-items:center;text-shadow:0 4px 0 rgba(160,60,0,.25)">${CAPTIONS[lang][i] || ''}</div>
          <div style="width:96px;height:10px;border-radius:5px;background:${CREAM};margin:20px 0 56px"></div>
          <img src="${png(path.join(RAW, f))}" style="width:800px;border-radius:56px;border:16px solid ${INK};box-shadow:0 40px 90px rgba(120,40,0,.4)">
        </div>`, 1080, 1920), 1080, 1920, path.join(OUT, `screenshots-${lang}`, f));
    }
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
