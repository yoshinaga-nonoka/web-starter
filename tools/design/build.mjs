// Design proposals: builds every proposal page, screenshots each at PC and phone size, and writes the gallery
// (design/index.html) that compares them. Run with `npm run design` (it builds the site first, for the header and footer).
//
//   design/rounds.json        the rounds, newest first: { id, title, note, uses?, picked?, shotAt? }
//   design/<round>/<x>.mjs    one proposal each (a, b, c, d …); see design/README.md for what a proposal exports
//   design/content.mjs        the copy the site-wide proposals share
//
// A round with "uses": "mv" builds on the round "mv"'s picked proposal: every page gets that main visual unchanged,
// and only what follows it differs. Its screenshots show the screen after the main visual (shotAt, else the 2nd section).
//
// usage: node --experimental-strip-types tools/design/build.mjs [--only mv | mv/a] [--no-shots] [--port 5483]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { args, launch, sleep } from '../browser/cdp.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const DESIGN = join(ROOT, 'design');
const a = args();
const only = a.only ? String(a.only) : '';
const port = +(a.port || 5483);

const site = await import(pathToFileURL(join(ROOT, 'src/lib/site.ts')).href);
const kit = await import(pathToFileURL(join(DESIGN, '_kit.mjs')).href);
const content = (await import(pathToFileURL(join(DESIGN, 'content.mjs')).href)).default;
const { rounds } = JSON.parse(readFileSync(join(DESIGN, 'rounds.json'), 'utf8'));

/* ---------------------------------------------------------------- the site's own header, footer and phone bar */
const distIndex = join(ROOT, 'dist/index.html');
if (!existsSync(distIndex)) { console.error('dist/index.html がありません。npm run design で実行してください（先にビルドします）'); process.exit(1); }
const dist = readFileSync(distIndex, 'utf8');
const grab = (re) => (dist.match(re)?.[0] ?? '').replace(/href="\/#/g, 'href="#');
const HEADER = grab(/<header class="nav">[\s\S]*?<\/header>/);
const FOOTER = grab(/<footer class="footer">[\s\S]*?<\/footer>/);
const BAR = grab(/<nav class="actionbar"[\s\S]*?<\/nav>/);

/* ---------------------------------------------------------------- colours and fonts: THEME, then the proposal's own */
const ROLE_FALLBACK = { display: site.THEME.fonts.display.fallback, text: site.THEME.fonts.text.fallback, en: site.THEME.fonts.en.fallback };
function font(role, v) {
  if (!v) return site.THEME.fonts[role];
  if (typeof v !== 'string') return { fallback: ROLE_FALLBACK[role], ...v };
  const [family, weights = '400'] = v.split(':');
  return { family, weights, fallback: ROLE_FALLBACK[role] };
}
function look(...mods) {
  const colors = { ...pick(site.THEME, ['bg', 'surface', 'ink', 'muted', 'accent', 'accentInk', 'inverseBg', 'inverseInk', 'radius']) };
  const fonts = {};
  for (const m of mods) { Object.assign(colors, m?.colors); Object.assign(fonts, m?.fonts); }
  const f = { display: font('display', fonts.display), text: font('text', fonts.text), en: font('en', fonts.en) };
  const fam = (x) => `family=${x.family.replace(/ /g, '+')}:${x.weights.includes('@') ? x.weights : `wght@${x.weights}`}`;
  const families = [...new Map(Object.values(f).map((x) => [x.family, x])).values()];
  return {
    colors, fonts: f,
    fontsUrl: `https://fonts.googleapis.com/css2?${families.map(fam).join('&')}&display=swap`,
    tokens: `:root {
  --bg: ${colors.bg}; --surface: ${colors.surface}; --ink: ${colors.ink}; --muted: ${colors.muted};
  --accent: ${colors.accent}; --accent-ink: ${colors.accentInk}; --inv-bg: ${colors.inverseBg}; --inv-ink: ${colors.inverseInk};
  --font-display: "${f.display.family}", ${f.display.fallback}; --font-text: "${f.text.family}", ${f.text.fallback};
  --font-en: "${f.en.family}", ${f.en.fallback}; --radius: ${colors.radius};
}`,
  };
}
function pick(o, keys) { return Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]])); }

function page({ round, id, mod, base }) {
  const ctx = { site, content, kit, round: round.id, id, mv: base };
  const lk = look(base, mod);
  const body = mod.body ? mod.body(ctx) : `${base ? base.hero(ctx) : mod.hero(ctx)}\n${mod.sections ? mod.sections(ctx) : ''}`;
  const css = [base?.css, mod.css].filter(Boolean).join('\n');
  return {
    look: lk,
    html: `<!doctype html>
<html lang="ja" data-proposal="${round.id}/${id}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${kit.esc(`${round.title} ${id.toUpperCase()}「${mod.name}」｜${site.SITE.name}`)}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/media/logo.svg" type="image/svg+xml">
<!-- 生成ファイル: design/${round.id}/${id}.mjs を直して npm run design -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${lk.fontsUrl}" rel="stylesheet">
<style>${lk.tokens}</style>
<link rel="stylesheet" href="/css/site.css">
<style>
${css}
</style>
</head>
<body>
${HEADER}
<main id="main">
${body}
</main>
${FOOTER}
${BAR}
<script defer src="/js/site.js"></script>
</body>
</html>
`,
  };
}

/* ---------------------------------------------------------------- build the pages */
const proposals = (rid) => {
  const dir = join(DESIGN, rid);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /^[a-z0-9-]+\.mjs$/.test(f) && !f.startsWith('_')).map((f) => f.replace(/\.mjs$/, '')).sort();
};
const load = async (rid, id) => (await import(`${pathToFileURL(join(DESIGN, rid, `${id}.mjs`)).href}?t=${Date.now()}`)).default;

const built = [];
for (const round of rounds) {
  let base;
  if (round.uses) {
    const from = rounds.find((r) => r.id === round.uses);
    if (!from?.picked) {
      console.warn(`- ${round.id}: 「${round.uses}」の決定案がまだありません（rounds.json の picked）。飛ばします`);
      continue;
    }
    base = await load(from.id, from.picked);
  }
  for (const id of proposals(round.id)) {
    const mod = await load(round.id, id);
    const { html, look: lk } = page({ round, id, mod, base });
    if (!only || only === round.id || only === `${round.id}/${id}`) writeFileSync(join(DESIGN, round.id, `${id}.html`), html);
    built.push({ round, id, mod, look: lk });
  }
}
const targets = built.filter((b) => !only || only === b.round.id || only === `${b.round.id}/${b.id}`);
console.log(`ページ: ${targets.map((b) => `${b.round.id}/${b.id}.html`).join(', ') || '（なし）'}`);

/* ---------------------------------------------------------------- screenshots (PC 1440x900, phone 390x844) */
if (!a['no-shots'] && targets.length) {
  const server = spawn(process.execPath, [join(ROOT, 'tools/serve.mjs'), `${DESIGN},${join(ROOT, 'public')}`, String(port)], { stdio: 'ignore' });
  await sleep(600);
  try {
    for (const b of targets) {
      mkdirSync(join(DESIGN, b.round.id, 'shots'), { recursive: true });
      for (const [w, h] of [[1440, 900], [390, 844]]) {
        const p = await launch({ width: w, height: h, scale: w < 640 ? 2 : 1 });
        try {
          await p.goto(`http://127.0.0.1:${port}/${b.round.id}/${b.id}.html`, +(b.round.shotWait || 3000));
          const at = b.round.shotAt || (b.round.uses ? 'main > section:nth-of-type(2)' : '');
          if (at) {
            await p.ev(`(() => { const el = document.querySelector(${JSON.stringify(at)}); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)); })()`);
            await sleep(2200);
          }
          await p.shot(join(DESIGN, b.round.id, 'shots', `${b.id}-${w}.jpg`));
        } finally { p.close(); }
      }
      console.log(`撮影: ${b.round.id}/${b.id}`);
    }
  } finally { server.kill(); }
}

/* ---------------------------------------------------------------- the gallery (design/index.html) */
const swatch = (c) => `<i style="background:${c}"></i>`;
const card = (b) => {
  const picked = b.round.picked === b.id;
  const href = `${b.round.id}/${b.id}.html`;
  const shot = (w) => `${b.round.id}/shots/${b.id}-${w}.jpg`;
  const has = existsSync(join(DESIGN, shot(1440)));
  const f = b.look.fonts;
  const fonts = [...new Set([f.display.family, f.text.family, f.en.family])].join(' ＋ ');
  return `<a class="card${picked ? ' card--pick' : ''}" href="${href}">
  <div class="shots" style="--bg:${b.look.colors.bg}">${has ? `<img class="pc" src="${shot(1440)}" alt="" loading="lazy"><img class="sp" src="${shot(390)}" alt="" loading="lazy">` : '<span class="noshot">npm run design で撮影</span>'}</div>
  <div class="body">
    <h3>${b.id.toUpperCase()}　${kit.esc(b.mod.name)}${picked ? '<span class="tag">決定案</span>' : ''}</h3>
    ${b.mod.layout ? `<p class="layout">${kit.esc(b.mod.layout)}</p>` : ''}
    <p>${kit.esc(b.mod.summary ?? '')}</p>
    <ul class="meta"><li>${[b.look.colors.bg, b.look.colors.accent, b.look.colors.ink].map(swatch).join('')}色</li><li>${kit.esc(fonts)}</li></ul>
  </div>
</a>`;
};
const sectionsHtml = rounds.map((r) => {
  const cards = built.filter((b) => b.round.id === r.id).sort((x, y) => (r.picked === y.id) - (r.picked === x.id));
  if (!cards.length) return '';
  return `<section class="round">
  <h2>${kit.esc(r.title)}<span>${cards.length}案</span></h2>
  ${r.note ? `<p class="note">${kit.esc(r.note)}</p>` : ''}
  <div class="grid">${cards.map(card).join('\n')}</div>
</section>`;
}).join('\n');
const now = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'long', timeStyle: 'short' }).format(new Date());
writeFileSync(join(DESIGN, 'index.html'), `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>デザイン案｜${kit.esc(site.SITE.name)}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/media/logo.svg" type="image/svg+xml">
<!-- 生成ファイル: npm run design（design/rounds.json と各案の .mjs から） -->
<style>
*{box-sizing:border-box}html,body{margin:0}
body{background:#f6f3ee;color:#2f2a24;font-family:"Hiragino Sans","Yu Gothic",sans-serif;line-height:1.75;-webkit-font-smoothing:antialiased}
.wrap{width:min(100% - 96px,1280px);margin:0 auto}
@media (max-width:639px){.wrap{width:calc(100% - 32px)}}
header{padding:48px 0 24px}
header h1{font-size:28px;font-weight:600;margin:0;letter-spacing:.04em}
header p{margin:6px 0 0;color:#6f655a;font-size:14px}
.round{padding:32px 0 56px;border-top:1px solid rgb(47 42 36 / .12)}
.round h2{font-size:22px;font-weight:600;margin:0 0 6px;display:flex;align-items:baseline;gap:12px}
.round h2 span{font-size:13px;color:#6f655a;font-weight:400}
.note{margin:0 0 24px;color:#6f655a;max-width:46em}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 24px}
@media (max-width:900px){.grid{grid-template-columns:minmax(0,1fr)}}
.card{display:block;color:inherit;text-decoration:none;background:#fff;border:1px solid rgb(47 42 36 / .12);border-radius:18px;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s}
.card:hover{transform:translateY(-2px);box-shadow:0 14px 28px -14px rgb(47 42 36 / .3);border-color:rgb(47 42 36 / .28)}
.card--pick{grid-column:1/-1;border:2px solid #2f2a24}
.shots{position:relative;aspect-ratio:1440/900;background:var(--bg);overflow:hidden;border-bottom:1px solid rgb(47 42 36 / .1)}
.shots .pc{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform .6s}
.card:hover .pc{transform:scale(1.02)}
.shots .sp{position:absolute;right:14px;bottom:14px;width:21%;border-radius:12px;border:1px solid rgb(47 42 36 / .15);box-shadow:0 8px 24px rgb(47 42 36 / .18)}
.card--pick .shots .sp{width:13%}
.noshot{position:absolute;inset:0;display:grid;place-items:center;color:#6f655a;font-size:13px}
.body{padding:20px 24px 24px}
.body h3{font-size:19px;font-weight:600;margin:0 0 4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.tag{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:999px;background:#2f2a24;color:#fff;font-size:12px}
.layout{margin:0 0 8px;font-size:13px;color:#6f655a}
.body p{margin:0 0 12px}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none;font-size:12px;color:#6f655a}
.meta li{display:flex;align-items:center;gap:4px;border:1px solid rgb(47 42 36 / .14);border-radius:999px;padding:2px 10px}
.meta i{width:11px;height:11px;border-radius:50%;display:inline-block;border:1px solid rgb(47 42 36 / .15)}
footer{padding:24px 0 48px;color:#6f655a;font-size:12px}
</style>
</head>
<body>
<div class="wrap">
<header><h1>${kit.esc(site.SITE.name)} デザイン案</h1><p>カードを開くと、実際の大きさで確認できます。スマホでも開けます。</p></header>
${sectionsHtml}
<footer>更新: ${now}</footer>
</div>
</body>
</html>
`);
console.log('一覧: design/index.html（npm run serve:design → http://127.0.0.1:5482/）');
