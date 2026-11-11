// メインビジュアル案A: 左に文字、右にアーチ窓の写真。いちばん素直な構図。
export default {
  name: 'アーチ窓',
  layout: '左に文字＋右に写真',
  summary: '写真をアーチの窓に入れ、左に大きな見出しと営業時間。落ち着いた明朝で、お店の空気をそのまま見せる案。',
  colors: { bg: '#faf6f0', accent: '#a4532a' },
  fonts: { display: 'Zen Old Mincho:500', text: 'Zen Kaku Gothic New:400;500' },
  css: `
.mv-a { padding: calc(var(--nav) + var(--s-8)) 0 var(--s-9); min-height: min(100svh, 980px); display: grid; align-items: center; }
.mv-a__grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: var(--s-8); align-items: center; }
.mv-a__eyebrow { color: var(--accent); font-size: var(--t-small); letter-spacing: .14em; margin-bottom: var(--s-4); }
.mv-a h1 { font-size: var(--t-h1); line-height: 1.3; letter-spacing: .06em; }
.mv-a__lead { margin: var(--s-6) 0 var(--s-7); color: var(--muted); font-size: var(--t-lead); }
.mv-a__art { justify-self: end; width: min(100%, 520px); position: relative; }
.mv-a__art .frame { border-radius: 999px 999px var(--radius) var(--radius); aspect-ratio: 4 / 5; }
.mv-a__art::before { content: ""; position: absolute; inset: -18px -18px 18px 18px; border: 1px solid var(--accent); border-radius: 999px 999px var(--radius) var(--radius); opacity: .4; }
@media (max-width: 959px) { .mv-a__grid { grid-template-columns: minmax(0, 1fr); } .mv-a__art { justify-self: center; width: min(100%, 420px); } }
@media (max-width: 639px) { .mv-a { min-height: 0; padding: calc(var(--nav) + var(--s-6)) 0 var(--s-8); } .mv-a__art { order: -1; width: min(100% - 24px, 300px); } .mv-a .btn--primary { display: none; } }
`,
  hero: ({ site, content, kit }) => `<section class="mv-a" aria-labelledby="mv-h">
  <div class="wrap mv-a__grid">
    <div>
      <p class="mv-a__eyebrow" data-reveal>${kit.esc(site.SITE.tagline)}</p>
      <h1 id="mv-h" data-reveal style="--i: 1">${content.hero.catch.map((l) => kit.nw(kit.esc(l))).join('<br>')}</h1>
      <p class="mv-a__lead" data-reveal style="--i: 2">${kit.esc(site.HOURS.days)} ${kit.esc(site.HOURS.time)}<br>${kit.esc(site.ADDRESS.access)}</p>
      <div class="btn-row" data-reveal style="--i: 3">${kit.btn(site.PRIMARY_ACTION.label, site.PRIMARY_ACTION.href, 'primary', site.PRIMARY_ACTION.icon)}${kit.btn('メニューを見る', '#menu', 'secondary', 'utensils')}</div>
    </div>
    <div class="mv-a__art">${kit.img(content.hero.photo, content.hero.photoAlt, { w: 720, h: 900, eager: true })}</div>
  </div>
</section>`,
};
