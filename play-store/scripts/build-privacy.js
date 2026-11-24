// Génère la politique de confidentialité en ligne (docs/confidentialite.html) et la page d'accueil (docs/index.html)
// à partir de constants/privacy.json, le même texte que la page « Confidentialité » de l'application.
// Usage : node play-store/scripts/build-privacy.js         (écrit les fichiers)
//         node play-store/scripts/build-privacy.js --check (échoue si les fichiers ne sont pas à jour)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DOCS = path.join(ROOT, 'docs');
const privacy = require('../../constants/privacy.json');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const withContact = (s) => esc(s).replace('{contact}', `<a href="mailto:${privacy.contact}">${privacy.contact}</a>`);

const STYLE = `:root{color-scheme:light dark;--bg:#FFF7E8;--card:#fff;--ink:#2A2342;--muted:#6B6485;--line:#E9DFCC;--accent:#D96A1F}
@media (prefers-color-scheme:dark){:root{--bg:#1B1726;--card:#252033;--ink:#F3EFFA;--muted:#B5AEC8;--line:#3A3350;--accent:#FFA559}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:32px 16px 56px}h1{font-size:30px;line-height:1.2;margin:0 0 6px}h2{font-size:19px;margin:28px 0 6px}
.muted{color:var(--muted)}.card{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:20px 22px;margin-top:20px}
a{color:var(--accent)}nav{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-weight:600}`;

const page = (title, body) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
${STYLE}
</style>
</head>
<body>
<main>
${body}
</main>
</body>
</html>
`;

function policy(lang) {
  const t = privacy[lang];
  const date = lang === 'fr' ? `Mise à jour : ${privacy.updated}` : `Last updated: ${privacy.updatedEn}`;
  return `<section class="card" id="${lang}" lang="${lang}">
<h1>${esc(t.title)}</h1>
<p class="muted">Hello English! · ${date}</p>
<p>${esc(t.intro)}</p>
${t.sections.map((s) => `<h2>${esc(s.title)}</h2>\n<p>${withContact(s.body)}</p>`).join('\n')}
</section>`;
}

function render() {
  return {
    'confidentialite.html': page('Hello English! · Politique de confidentialité / Privacy policy',
      `<nav><a href="./">Hello English!</a><a href="#fr">Français</a><a href="#en">English</a></nav>\n${policy('fr')}\n${policy('en')}`),
    'index.html': page('Hello English! · L\'anglais en jouant, de la maternelle à la 3e',
      `<section class="card">
<h1>Hello English! 🎈</h1>
<p class="muted">L'anglais en jouant, de la maternelle à la 3e</p>
<p>Application Android gratuite, sans publicité et sans compte, qui suit les programmes officiels d'anglais de l'Éducation nationale : 12 niveaux, 90 unités, 8 jeux (écoute, parole, lecture, memory, orthographe, quiz, phrases).</p>
<p><a href="confidentialite.html">Politique de confidentialité</a> · <a href="confidentialite.html#en">Privacy policy</a> · Contact : <a href="mailto:${privacy.contact}">${privacy.contact}</a></p>
</section>`),
  };
}

if (require.main === module) {
  const files = render();
  const stale = [];
  for (const [name, html] of Object.entries(files)) {
    const file = path.join(DOCS, name);
    if (process.argv.includes('--check')) {
      if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== html) stale.push(`docs/${name}`);
    } else {
      fs.mkdirSync(DOCS, { recursive: true });
      fs.writeFileSync(file, html);
      console.log(`docs/${name}`);
    }
  }
  if (stale.length) {
    console.error(`Pas à jour : ${stale.join(', ')}. Lancez node play-store/scripts/build-privacy.js`);
    process.exit(1);
  }
}

module.exports = { render };
