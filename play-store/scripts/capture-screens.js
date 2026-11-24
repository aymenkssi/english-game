/**
 * Captures brutes de l'application (export web) pour la fiche Google Play : play-store/build/raw/*.png (1080 x 1920).
 * Les écrans sont les mêmes pour toutes les langues de la fiche (l'interface est en français).
 *
 * Depuis la racine du dépôt :
 *   npx expo export --platform web --output-dir play-store/build/web
 *   npx serve -s -l 3000 play-store/build/web        (dans un autre terminal)
 *   node play-store/scripts/capture-screens.js [chemin vers playwright]
 */
const fs = require('fs');
const path = require('path');

const { chromium } = require(process.argv[2] || 'playwright');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'build', 'raw');

// Une progression réaliste, pour que l'accueil et « Ma progression » ne soient pas vides.
const PROGRESS = {
  'ce1.days.listen': 3, 'ce1.days.speak': 3, 'ce1.days.read': 3, 'ce1.days.memory': 3, 'ce1.days.spell': 3,
  'ce1.numbers.listen': 3, 'ce1.numbers.speak': 2, 'ce1.numbers.read': 3, 'ce1.numbers.memory': 2, 'ce1.numbers.spell': 3,
  'ce1.clothes.listen': 3, 'ce1.clothes.speak': 2, 'ce1.clothes.read': 2,
  'ce1.questions.quiz': 3, 'ce1.questions.speak': 2, 'ce1.festivals.quiz': 2,
  'cp.pets.listen': 3, 'cp.pets.speak': 3, 'cp.colours.listen': 3, 'cp.colours.read': 3, 'cp.numbers.memory': 3,
};
const LAST = { level: 'ce1', unit: 'clothes', game: 'memory' };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });

  await page.addInitScript(({ progress, last }) => {
    // Tirages reproductibles (mêmes questions et mêmes cartes à chaque fois).
    let seed = 7;
    Math.random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    localStorage.setItem('hello-english-progress', JSON.stringify(progress));
    localStorage.setItem('hello-english-last', JSON.stringify(last));
    // Pas de voix pendant les captures, et une reconnaissance vocale simulée qui « entend » window.__heard.
    window.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [], pause() {}, resume() {}, addEventListener() {}, removeEventListener() {} };
    class FakeRecognition extends EventTarget {
      start() {
        setTimeout(() => {
          const list = [{ transcript: window.__heard || '', confidence: 0.9 }];
          list.isFinal = true;
          const e = new Event('result');
          e.resultIndex = 0;
          e.results = [list];
          this.dispatchEvent(e);
          this.dispatchEvent(new Event('end'));
        }, 100);
      }
      stop() {}
      abort() {}
    }
    window.webkitSpeechRecognition = FakeRecognition;
  }, { progress: PROGRESS, last: LAST });

  const go = async (route) => {
    await page.goto(BASE + route);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
  };
  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(`play-store/build/raw/${name}.png`);
  };

  await go('/');
  await shot('01-home');

  await go('/level/ce1');
  await shot('02-level');

  await go('/play/ce2/weather/explore');
  await shot('03-explore');

  await go('/play/cp/pets/speak');
  const target = (await page.getByLabel('Réécouter').innerText()).split('\n').map((s) => s.trim()).filter(Boolean)[1];
  await page.evaluate((t) => { window.__heard = t; }, target);
  await page.getByLabel('Parler').click();
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 160);
  await page.waitForTimeout(200);
  await shot('04-speak');

  await go('/play/6e/present/quiz');
  for (const answer of await page.locator('[role=button]').filter({ hasNotText: /✕/ }).all()) {
    if (await page.getByText('Continuer →').count()) break;
    await answer.click().catch(() => {});
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(300);
  await shot('05-quiz');

  await go('/play/cm2/jobs/memory');
  // Cherche la paire de la première carte (image + mot anglais), puis retourne une autre carte.
  const cards = page.locator('[role=button]:not([aria-label="Quitter"])');
  const total = await cards.count();
  for (let i = 1; i < total; i++) {
    await cards.nth(0).click();
    await page.waitForTimeout(150);
    await cards.nth(i).click();
    // Une mauvaise paire se referme au bout d'une seconde ; une bonne reste ouverte.
    await page.waitForTimeout(1300);
    if ((await page.getByLabel('Carte retournée').count()) === total - 2) break;
  }
  await page.getByLabel('Carte retournée').nth(3).click();
  await page.waitForTimeout(400);
  await shot('06-memory');

  await go('/progression');
  await shot('07-progress');

  await go('/programme');
  await shot('08-programme');

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
