// メインビジュアル案D: 縦書きの見出しを右に、縦長の写真を左に。
export default {
  name: '縦書き',
  layout: '左に写真＋右に縦書き',
  summary: '縦書きの大きな見出しと、縦長の写真。和の落ち着きと余白で見せる、いちばん日本語らしい案。',
  colors: { bg: '#f4f1ea', surface: '#e8e2d6', accent: '#8a3b2e', ink: '#25211d' },
  fonts: { display: 'Shippori Mincho B1:600', text: 'Zen Kaku Gothic New:400;500', en: 'Cormorant Garamond:ital,wght@1,500' },
  css: `
.mv-d { padding: calc(var(--nav) + var(--s-7)) 0 var(--s-8); min-height: min(100svh, 980px); display: grid; align-items: center; }
.mv-d__grid { display: grid; grid-template-columns: minmax(0, 1.2fr) auto minmax(0, .8fr); gap: var(--s-8); align-items: center; }
.mv-d__photo .frame { aspect-ratio: 3 / 4; border-radius: 0 160px 0 0; }
.mv-d h1 { writing-mode: vertical-rl; font-size: clamp(40px, 5.4vw, 76px); line-height: 1.6; letter-spacing: .14em; height: min(72svh, 620px); }
.mv-d__info { display: grid; gap: var(--s-5); align-self: end; }
.mv-d__info p { color: var(--muted); font-size: var(--t-lead); border-top: 1px solid var(--line); padding-top: var(--s-4); }
@media (max-width: 959px) { .mv-d__grid { grid-template-columns: minmax(0, 1fr) auto; } .mv-d__info { grid-column: 1 / -1; } }
@media (max-width: 639px) {
  .mv-d { min-height: 0; padding: calc(var(--nav) + var(--s-5)) 0 var(--s-8); }
  .mv-d__grid { gap: var(--s-5); }
  .mv-d h1 { height: auto; max-height: 64svh; font-size: clamp(30px, 9vw, 40px); }
  .mv-d .btn--primary { display: none; }
}
`,
  hero: ({ site, content, kit }) => `<section class="mv-d" aria-labelledby="mv-h">
  <div class="wrap mv-d__grid">
    <div class="mv-d__photo">${kit.img(content.hero.photo, content.hero.photoAlt, { w: 720, h: 960, eager: true })}</div>
    <h1 id="mv-h" data-reveal>${content.hero.catch.map((l) => kit.esc(l)).join('<br>')}</h1>
    <div class="mv-d__info" data-reveal style="--i: 1">
      <p>${kit.esc(site.HOURS.days)}<br>${kit.esc(site.HOURS.time)}</p>
      <p>${kit.esc(site.ADDRESS.access)}</p>
      <div class="btn-row">${kit.btn(site.PRIMARY_ACTION.label, site.PRIMARY_ACTION.href, 'primary', site.PRIMARY_ACTION.icon)}${kit.btn('メニューを見る', '#menu', 'secondary', 'utensils')}</div>
    </div>
  </div>
</section>`,
};
