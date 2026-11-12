// Dessine l'icône de l'application, l'icône adaptative Android, l'image de démarrage et le favicon.
// Usage : node scripts/make-icons.js [chemin vers playwright]
const fs = require('fs');
const path = require('path');

const { chromium } = require(process.argv[2] || 'playwright');
const DIR = path.join(__dirname, '..', 'assets', 'images');
const FONT = fs
  .readFileSync(path.join(__dirname, '..', 'node_modules', '@expo-google-fonts', 'fredoka', '700Bold', 'Fredoka_700Bold.ttf'))
  .toString('base64');

// Une bulle de dialogue blanche avec « Hi! », sur fond orange (ou transparent pour l'icône adaptative).
const page = (size, bubble, background) => `<!doctype html><html><head><style>
  @font-face { font-family: F; src: url(data:font/ttf;base64,${FONT}); }
  body { margin: 0; width: ${size}px; height: ${size}px; background: ${background}; display: flex; align-items: center; justify-content: center; }
  .b { position: relative; width: ${bubble}px; height: ${bubble * 0.74}px; background: #fff; border-radius: ${bubble * 0.2}px;
       display: flex; align-items: center; justify-content: center; font: ${bubble * 0.46}px F; color: #2A2342; margin-bottom: ${bubble * 0.12}px; }
  .b::after { content: ''; position: absolute; left: ${bubble * 0.16}px; bottom: ${-bubble * 0.17}px;
       border-left: ${bubble * 0.2}px solid #fff; border-bottom: ${bubble * 0.2}px solid transparent; }
  i { color: #FF8A3D; font-style: normal; }
</style></head><body><div class="b">Hi<i>!</i></div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage();
  const shot = async (html, file, size) => {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(html);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(DIR, file), omitBackground: true });
    console.log(`assets/images/${file}`);
  };
  const orange = 'linear-gradient(160deg, #FFA559, #FF7A2B)';
  await shot(page(1024, 640, orange), 'icon.png', 1024);
  // Icône adaptative : le motif tient dans la zone sûre (66 % du centre).
  await shot(page(1024, 460, 'transparent'), 'adaptive-icon.png', 1024);
  await shot(page(1024, 760, 'transparent').replace('#fff;', '#FF8A3D;').replace('solid #fff', 'solid #FF8A3D').replace('color: #2A2342', 'color: #fff').replace('i { color: #FF8A3D', 'i { color: #FFE7D3'), 'splash-icon.png', 1024);
  await shot(page(96, 62, orange), 'favicon.png', 96);
  await browser.close();
})();
