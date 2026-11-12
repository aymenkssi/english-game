/* Hello English! — moteur du jeu (aucune dépendance). */
(() => {
  "use strict";

  const CYCLES = [
    { name: "Maternelle", sub: "Éveil aux langues · tout à l'oral", cls: "c0", icon: "🧸" },
    { name: "Élémentaire · cycle 2", sub: "CP, CE1, CE2 · vers le niveau A1", cls: "c1", icon: "✏️" },
    { name: "Cycle 3", sub: "CM1, CM2, 6e · niveau A1 puis A1+", cls: "c2", icon: "🌍" },
    { name: "Collège · cycle 4", sub: "5e, 4e, 3e · de A2 à B1", cls: "c3", icon: "🚀" },
  ];

  const GAMES = {
    explore: { name: "Découvrir", desc: "Touche les cartes pour écouter", icon: "👀", scored: false },
    listen: { name: "Écoute", desc: "Écoute et trouve la bonne carte", icon: "🎧", scored: true },
    read: { name: "Le bon mot", desc: "Trouve le mot anglais", icon: "🔤", scored: true },
    memory: { name: "Memory", desc: "Retrouve les paires", icon: "🃏", scored: true },
    spell: { name: "Épelle", desc: "Remets les lettres dans l'ordre", icon: "🔡", scored: true },
    quiz: { name: "Quiz", desc: "Choisis la bonne réponse", icon: "❓", scored: true },
    order: { name: "Phrases", desc: "Remets les mots dans l'ordre", icon: "🧩", scored: true },
  };

  const app = document.getElementById("app");
  const levelById = (id) => LEVELS.find((l) => l.id === id);

  /* ---------- petits outils ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "style") el.style.cssText = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  }
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const graphemes = (s) =>
    typeof Intl !== "undefined" && Intl.Segmenter ? [...new Intl.Segmenter().segment(s)].map((x) => x.segment) : [...s];

  /* ---------- progression (localStorage) ---------- */
  const store = {
    data: {},
    load() {
      try { this.data = JSON.parse(localStorage.getItem("hello-english-progress") || "{}"); } catch { this.data = {}; }
    },
    stars(l, u, g) { return this.data[`${l}.${u}.${g}`] || 0; },
    save(l, u, g, n) {
      const k = `${l}.${u}.${g}`;
      if (n > (this.data[k] || 0)) {
        this.data[k] = n;
        try { localStorage.setItem("hello-english-progress", JSON.stringify(this.data)); } catch { /* stockage indisponible */ }
      }
    },
    reset() {
      this.data = {};
      try { localStorage.removeItem("hello-english-progress"); } catch { /* idem */ }
    },
  };
  store.load();

  function gamesFor(level, unit) {
    if (unit.type === "q") return ["quiz"];
    if (unit.type === "o") return ["order"];
    const g = ["explore", "listen"];
    if (level.read) g.push("read");
    g.push("memory");
    if (level.spell) g.push("spell");
    return g;
  }
  const scoredGames = (level, unit) => gamesFor(level, unit).filter((g) => GAMES[g].scored);
  function unitStars(level, unit) {
    const gs = scoredGames(level, unit);
    return { got: gs.reduce((s, g) => s + store.stars(level.id, unit.id, g), 0), max: gs.length * 3 };
  }
  function levelStars(level) {
    return level.units.reduce((acc, u) => {
      const s = unitStars(level, u);
      return { got: acc.got + s.got, max: acc.max + s.max };
    }, { got: 0, max: 0 });
  }

  /* ---------- voix et sons ---------- */
  const voice = {
    ok: "speechSynthesis" in window,
    pick() {
      if (!this.ok) return null;
      const vs = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
      return vs.find((v) => /en[-_]GB/i.test(v.lang)) || vs.find((v) => /en[-_]US/i.test(v.lang)) || vs[0] || null;
    },
    say(text, slow) {
      if (!this.ok) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/_+/g, " "));
      const v = this.pick();
      if (v) u.voice = v;
      u.lang = v ? v.lang : "en-GB";
      u.rate = slow ? 0.75 : 0.9;
      speechSynthesis.speak(u);
    },
  };
  if (voice.ok) speechSynthesis.onvoiceschanged = () => {};

  let actx;
  function tone(freqs, dur = 0.12, type = "sine") {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime;
      for (const f of freqs) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(actx.destination);
        o.start(t); o.stop(t + dur);
        t += dur * 0.8;
      }
    } catch { /* pas de son : le jeu reste jouable */ }
  }
  const sfx = {
    good: () => tone([660, 880]),
    bad: () => tone([200], 0.2, "triangle"),
    win: () => tone([523, 659, 784, 1047], 0.16),
    flip: () => tone([440], 0.05),
  };

  /* ---------- rendu d'un mot ---------- */
  // mot = [image, anglais, français] ; image vide → on affiche le français.
  function picture(w, withCaption) {
    const [img, , fr] = w;
    if (img && img[0] === "#") return h("span", { class: "pic swatch", style: `background:${img}`, role: "img", "aria-label": fr });
    if (img) {
      const parts = graphemes(img);
      const n = parts.length;
      // Plusieurs symboles (quantités à compter) : un élément par symbole pour qu'ils passent à la ligne.
      const box = h("span", { class: "pic emoji" + (n > 2 ? " tiny" : n > 1 ? " small" : ""), role: "img", "aria-label": fr },
        n > 2 ? parts.map((g) => h("span", {}, g)) : img);
      return withCaption ? h("span", { class: "picwrap" }, box, h("span", { class: "cap" }, fr)) : box;
    }
    return h("span", { class: "pic text" + (fr.length > 14 ? " long" : "") }, fr);
  }
  const starRow = (n, max = 3) =>
    h("span", { class: "stars", "aria-label": `${n} étoile${n > 1 ? "s" : ""} sur ${max}` },
      Array.from({ length: max }, (_, i) => h("span", { class: i < n ? "on" : "" }, "★")));

  /* ---------- navigation ---------- */
  const go = (hash) => { location.hash = hash; };
  function render() {
    if (voice.ok) speechSynthesis.cancel();
    const [, view, a, b, c] = location.hash.replace(/^#/, "").split("/").map(decodeURIComponent);
    const level = levelById(a);
    const unit = level && level.units.find((u) => u.id === b);
    app.className = level ? CYCLES[level.cycle].cls : "";
    app.replaceChildren();
    if (view === "level" && level) viewLevel(level);
    else if (view === "unit" && unit) viewUnit(level, unit);
    else if (view === "play" && unit && gamesFor(level, unit).includes(c)) viewPlay(level, unit, c);
    else if (view === "programme") viewProgramme();
    else viewHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", render);

  function topbar(title, back, right) {
    return h("header", { class: "topbar" },
      back ? h("button", { class: "iconbtn", "aria-label": "Retour", onclick: () => go(back) }, "←") : h("span", { class: "iconbtn ghost" }),
      h("h1", {}, title),
      right || h("span", { class: "iconbtn ghost" }));
  }

  /* ---------- accueil ---------- */
  function viewHome() {
    const total = LEVELS.reduce((s, l) => s + levelStars(l).got, 0);
    app.append(...[
      h("section", { class: "hero" },
        h("div", { class: "balloons", "aria-hidden": "true" }, "🎈"),
        h("h1", {}, "Hello English!"),
        h("p", {}, "L'anglais en jouant, de la maternelle à la 3e"),
        h("p", { class: "total" }, starRow(1, 1), ` ${total} étoile${total > 1 ? "s" : ""} gagnée${total > 1 ? "s" : ""}`)),
      !voice.ok && h("p", { class: "notice" }, "🔇 Ce navigateur ne peut pas lire les mots à voix haute. Les jeux d'écoute afficheront le mot à la place."),
      CYCLES.map((cy, i) =>
        h("section", { class: `cycle ${cy.cls}` },
          h("h2", {}, h("span", { "aria-hidden": "true" }, cy.icon + " "), cy.name),
          h("p", { class: "sub" }, cy.sub),
          h("div", { class: "levels" },
            LEVELS.filter((l) => l.cycle === i).map((l) => {
              const s = levelStars(l);
              return h("button", { class: "level", onclick: () => go(`/level/${l.id}`) },
                h("span", { class: "short" }, l.short),
                h("span", { class: "lname" }, l.name),
                h("span", { class: "bar" }, h("i", { style: `width:${s.max ? (100 * s.got) / s.max : 0}%` })),
                h("span", { class: "count" }, `★ ${s.got} / ${s.max}`));
            })))),
      h("footer", { class: "foot" },
        h("button", { class: "link", onclick: () => go("/programme") }, "📘 Le programme officiel, niveau par niveau"),
        h("button", {
          class: "link", onclick: () => {
            if (confirm("Effacer toutes les étoiles gagnées sur cet appareil ?")) { store.reset(); render(); }
          },
        }, "Remettre les étoiles à zéro")),
    ].flat().filter(Boolean));
  }

  /* ---------- page d'un niveau ---------- */
  function viewLevel(level) {
    const s = levelStars(level);
    app.append(
      topbar(level.name, "/", h("span", { class: "badge" }, level.cefr)),
      h("p", { class: "goal" }, level.goal),
      h("p", { class: "leveltotal" }, starRow(1, 1), ` ${s.got} / ${s.max}`),
      h("div", { class: "units" },
        level.units.map((u) => {
          const us = unitStars(level, u);
          const only = gamesFor(level, u);
          const target = only.length === 1 ? `/play/${level.id}/${u.id}/${only[0]}` : `/unit/${level.id}/${u.id}`;
          return h("button", { class: "unit" + (us.got === us.max ? " done" : ""), onclick: () => go(target) },
            h("span", { class: "uicon", "aria-hidden": "true" }, u.icon),
            h("span", { class: "utext" }, h("b", {}, u.title), h("small", { lang: "en" }, u.en)),
            h("span", { class: "ustars" }, `★ ${us.got}/${us.max}`));
        })));
  }

  /* ---------- page d'une unité ---------- */
  function viewUnit(level, unit) {
    app.append(
      topbar(unit.title, `/level/${level.id}`),
      h("p", { class: "goal", lang: "en" }, `${unit.icon} ${unit.en}`),
      h("div", { class: "games" },
        gamesFor(level, unit).map((g) =>
          h("button", { class: "game", onclick: () => go(`/play/${level.id}/${unit.id}/${g}`) },
            h("span", { class: "gicon", "aria-hidden": "true" }, GAMES[g].icon),
            h("span", { class: "utext" }, h("b", {}, GAMES[g].name), h("small", {}, GAMES[g].desc)),
            GAMES[g].scored ? starRow(store.stars(level.id, unit.id, g)) : null))));
  }

  /* ---------- écran de jeu ---------- */
  function viewPlay(level, unit, game) {
    const back = gamesFor(level, unit).length === 1 ? `/level/${level.id}` : `/unit/${level.id}/${unit.id}`;
    const bar = h("i", {});
    const stage = h("main", { class: "stage" });
    app.append(
      h("header", { class: "playbar" },
        h("button", { class: "iconbtn", "aria-label": "Quitter", onclick: () => go(back) }, "✕"),
        h("span", { class: "progress" }, bar),
        h("span", { class: "gtag" }, GAMES[game].icon)),
      stage);

    const ctx = {
      level, unit, stage,
      progress: (p) => { bar.style.width = `${Math.round(p * 100)}%`; },
      finish(stars, line) {
        store.save(level.id, unit.id, game, stars);
        sfx.win();
        stage.replaceChildren(
          h("div", { class: "result" },
            h("div", { class: "bigstars" }, starRow(stars)),
            h("h2", {}, ["Continue !", "Bien joué !", "Bravo !", "Parfait !"][stars]),
            h("p", {}, line),
            h("div", { class: "row" },
              h("button", { class: "btn ghost", onclick: render }, "↻ Rejouer"),
              h("button", { class: "btn", onclick: () => go(back) }, "Continuer →"))));
      },
    };
    ({ explore: playExplore, listen: playChoice, read: playChoice, quiz: playQuiz, memory: playMemory, spell: playSpell, order: playOrder })[game](ctx, game);
  }

  const starsFor = (good, total) => (good / total >= 0.9 ? 3 : good / total >= 0.6 ? 2 : 1);

  /* Découvrir : cartes à toucher */
  function playExplore({ level, unit, stage, progress }) {
    progress(1);
    stage.append(
      h("p", { class: "hint" }, "Touche une carte pour écouter le mot."),
      h("div", { class: "grid explore" },
        unit.words.map((w) =>
          h("button", { class: "card", onclick: () => voice.say(w[1], true) },
            picture(w, false),
            level.read ? h("span", { class: "word", lang: "en" }, w[1]) : null,
            level.read && w[0] ? h("span", { class: "cap" }, w[2]) : null))));
  }

  /* Écoute (mot entendu → image) et Le bon mot (image → mot écrit) */
  async function playChoice({ level, unit, stage, progress, finish }, mode) {
    const rounds = shuffle(unit.words).slice(0, level.cycle === 0 ? 6 : 8);
    let good = 0;
    for (let i = 0; i < rounds.length; i++) {
      progress(i / rounds.length);
      const target = rounds[i];
      const others = shuffle(unit.words.filter((w) => w[1] !== target[1])).slice(0, level.choices - 1);
      const options = shuffle([target, ...others]);
      const first = await new Promise((resolve) => {
        let clean = true;
        const say = () => voice.say(target[1], true);
        const prompt = mode === "listen"
          ? h("button", { class: "speaker", "aria-label": "Réécouter", onclick: say }, "🔊",
              !voice.ok ? h("span", { class: "word", lang: "en" }, target[1]) : null)
          : h("div", { class: "prompt" }, picture(target, true));
        const grid = h("div", { class: `grid choices n${options.length} ${mode}` },
          options.map((o) => {
            const b = h("button", { class: "card" },
              mode === "listen" ? picture(o, level.read) : h("span", { class: "word", lang: "en" }, o[1]));
            b.addEventListener("click", async () => {
              if (b.disabled) return;
              if (o === target) {
                grid.querySelectorAll("button").forEach((x) => (x.disabled = true));
                b.classList.add("right"); sfx.good();
                if (mode === "read") say();
                await wait(mode === "read" ? 1100 : 800);
                resolve(clean);
              } else {
                clean = false; b.disabled = true; b.classList.add("wrong"); sfx.bad();
              }
            });
            return b;
          }));
        stage.replaceChildren(
          h("p", { class: "hint" }, mode === "listen" ? "Écoute et touche la bonne carte." : "Comment dit-on en anglais ?"),
          prompt, grid);
        if (mode === "listen") say();
      });
      if (first) good++;
    }
    progress(1);
    finish(starsFor(good, rounds.length), `${good} sur ${rounds.length} du premier coup`);
  }

  /* Quiz : grammaire et culture */
  async function playQuiz({ unit, stage, progress, finish }) {
    const rounds = shuffle(unit.items).slice(0, 10);
    let good = 0;
    for (let i = 0; i < rounds.length; i++) {
      progress(i / rounds.length);
      const [q, answer, wrongs, why] = rounds[i];
      const first = await new Promise((resolve) => {
        let clean = true;
        const after = h("div", { class: "after" });
        const grid = h("div", { class: "list" },
          shuffle([answer, ...wrongs]).map((o) => {
            const b = h("button", { class: "card answer", lang: "en" }, o);
            b.addEventListener("click", () => {
              if (b.disabled) return;
              if (o === answer) {
                grid.querySelectorAll("button").forEach((x) => (x.disabled = true));
                b.classList.add("right"); sfx.good();
                if (/_/.test(q)) voice.say(q.replace(/_+( \/ _+)?/, answer.replace(" / ", " ")).replace(/\(.*?\)|[^\x20-\x7e’']/g, ""));
                after.replaceChildren(
                  h("p", { class: "why" }, "💡 " + why),
                  h("button", { class: "btn", onclick: () => resolve(clean) }, "Continuer →"));
                after.querySelector("button").focus();
              } else {
                clean = false; b.disabled = true; b.classList.add("wrong"); sfx.bad();
              }
            });
            return b;
          }));
        stage.replaceChildren(h("div", { class: "question" }, q), grid, after);
      });
      if (first) good++;
    }
    progress(1);
    finish(starsFor(good, rounds.length), `${good} sur ${rounds.length} du premier coup`);
  }

  /* Memory */
  function playMemory({ level, unit, stage, progress, finish }) {
    const pairs = shuffle(unit.words).slice(0, level.id === "ps" ? 4 : 6);
    // Avant la lecture : deux images identiques. Ensuite : une image et le mot anglais.
    const cards = shuffle(pairs.flatMap((w, i) => [
      { id: i, w, face: "pic" },
      { id: i, w, face: level.read ? "word" : "pic" },
    ]));
    let open = [], found = 0, tries = 0, lock = false;
    const grid = h("div", { class: `grid memory n${cards.length}` },
      cards.map((c) => {
        const b = h("button", { class: "flip", "aria-label": "Carte retournée" },
          h("span", { class: "back", "aria-hidden": "true" }, "?"),
          h("span", { class: "front" }, c.face === "pic" ? picture(c.w, false) : h("span", { class: "word", lang: "en" }, c.w[1])));
        b.addEventListener("click", async () => {
          if (lock || b.classList.contains("open")) return;
          b.classList.add("open"); sfx.flip(); voice.say(c.w[1], true);
          open.push({ c, b });
          if (open.length < 2) return;
          tries++; lock = true;
          const [x, y] = open; open = [];
          if (x.c.id === y.c.id) {
            await wait(350);
            x.b.classList.add("found"); y.b.classList.add("found"); sfx.good();
            found++; progress(found / pairs.length);
            if (found === pairs.length) {
              await wait(700);
              const n = pairs.length;
              return finish(tries <= n + 3 ? 3 : tries <= 2 * n + 2 ? 2 : 1, `Toutes les paires en ${tries} essais`);
            }
          } else {
            await wait(1000);
            x.b.classList.remove("open"); y.b.classList.remove("open");
          }
          lock = false;
        });
        return b;
      }));
    stage.append(h("p", { class: "hint" }, "Retourne deux cartes pour former une paire."), grid);
  }

  /* Épelle */
  async function playSpell({ unit, stage, progress, finish }) {
    const pool = unit.words.filter((w) => w[1].length <= 16);
    const rounds = shuffle(pool).slice(0, 6);
    let good = 0;
    for (let i = 0; i < rounds.length; i++) {
      progress(i / rounds.length);
      const w = rounds[i], word = w[1];
      const first = await new Promise((resolve) => {
        let clean = true, pos = 0;
        const isLetter = (ch) => /[a-z]/i.test(ch);
        const slots = [...word].map((ch) => h("span", { class: "slot" + (isLetter(ch) ? "" : " fixed") }, isLetter(ch) ? "" : ch));
        const skip = () => { while (pos < word.length && !isLetter(word[pos])) pos++; };
        skip();
        const tiles = h("div", { class: "tiles" },
          shuffle([...word].filter(isLetter)).map((ch) => {
            const b = h("button", { class: "tile", lang: "en" }, ch);
            b.addEventListener("click", async () => {
              if (ch.toLowerCase() === word[pos].toLowerCase()) {
                slots[pos].textContent = word[pos]; slots[pos].classList.add("filled");
                b.disabled = true; b.classList.add("used"); pos++; skip();
                if (pos >= word.length) {
                  sfx.good(); voice.say(word, true);
                  tiles.querySelectorAll("button").forEach((x) => (x.disabled = true));
                  await wait(1200); resolve(clean);
                }
              } else {
                clean = false; sfx.bad(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
              }
            });
            return b;
          }));
        stage.replaceChildren(
          h("p", { class: "hint" }, "Touche les lettres dans le bon ordre."),
          h("div", { class: "prompt" }, picture(w, true),
            h("button", { class: "minispeaker", "aria-label": "Écouter le mot", onclick: () => voice.say(word, true) }, "🔊")),
          h("div", { class: "slots", lang: "en" }, slots), tiles);
        voice.say(word, true);
      });
      if (first) good++;
    }
    progress(1);
    finish(starsFor(good, rounds.length), `${good} mot${good > 1 ? "s" : ""} sur ${rounds.length} sans erreur`);
  }

  /* Phrases à remettre dans l'ordre */
  async function playOrder({ unit, stage, progress, finish }) {
    const rounds = shuffle(unit.items).slice(0, 6);
    let good = 0;
    for (let i = 0; i < rounds.length; i++) {
      progress(i / rounds.length);
      const [en, fr] = rounds[i];
      const words = en.split(" ");
      const first = await new Promise((resolve) => {
        let clean = true;
        const answer = h("div", { class: "answerline", lang: "en" });
        const bank = h("div", { class: "tiles words", lang: "en" });
        const check = h("button", { class: "btn", disabled: true }, "Vérifier");
        const sync = () => { check.disabled = bank.children.length > 0; answer.classList.remove("bad"); };
        let order = shuffle(words.map((w, k) => ({ w, k })));
        if (words.length > 1 && order.every((o, k) => o.k === k)) order.reverse();
        order.forEach(({ w }) => {
          const b = h("button", { class: "tile word" }, w);
          b.addEventListener("click", () => {
            if (check.dataset.done) return;
            (b.parentNode === bank ? answer : bank).append(b); sync();
          });
          bank.append(b);
        });
        check.addEventListener("click", async () => {
          if (check.dataset.done) return resolve(clean);
          const said = [...answer.children].map((b) => b.textContent).join(" ");
          if (said === en) {
            check.dataset.done = "1"; answer.classList.add("ok"); sfx.good(); voice.say(en);
            check.textContent = "Continuer →";
          } else {
            clean = false; sfx.bad(); answer.classList.add("bad");
          }
        });
        stage.replaceChildren(
          h("p", { class: "hint" }, "Remets les mots dans l'ordre."),
          h("div", { class: "question fr" }, fr), answer, bank, check);
      });
      if (first) good++;
    }
    progress(1);
    finish(starsFor(good, rounds.length), `${good} phrase${good > 1 ? "s" : ""} sur ${rounds.length} du premier coup`);
  }

  /* ---------- programme officiel ---------- */
  function viewProgramme() {
    const sources = [
      ["Maternelle", "Programme de l'école maternelle et Guide pour l'éveil à la diversité linguistique en maternelle (Eduscol, 2023)", "https://eduscol.education.fr/document/50921/download"],
      ["Cycles 2 et 3", "Programmes et attendus de fin d'année en langues vivantes (Eduscol)", "https://eduscol.education.fr/164/langues-vivantes-cycles-2-3-et-4"],
      ["Collège", "Programmes de langues vivantes, BO n° 22 du 29 mai 2025, annexe 3 : anglais", "https://www.education.gouv.fr/sites/default/files/ensel621_annexe3.pdf"],
    ];
    app.append(
      topbar("Le programme officiel", "/"),
      h("p", { class: "goal" }, "Chaque niveau du jeu reprend les objectifs, les thèmes et le niveau du Cadre européen (CECRL) fixés par les programmes de l'Éducation nationale."),
      h("div", { class: "prog" },
        LEVELS.map((l) =>
          h("article", { class: CYCLES[l.cycle].cls },
            h("h3", {}, l.name, " ", h("span", { class: "badge" }, l.cefr)),
            h("p", {}, l.goal),
            h("ul", {}, l.units.map((u) => h("li", {}, `${u.icon} ${u.title}`))),
            h("button", { class: "btn small", onclick: () => go(`/level/${l.id}`) }, "Jouer →")))),
      h("section", { class: "sources" },
        h("h3", {}, "Textes de référence"),
        h("ul", {}, sources.map(([k, t, url]) => h("li", {}, h("b", {}, k + " : "), h("a", { href: url, target: "_blank", rel: "noopener" }, t))))));
  }

  render();
})();
