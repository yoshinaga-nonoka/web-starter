// メインビジュアル案B: 写真を画面いっぱいに敷き、左下に白い文字。
export default {
  name: '全面の写真',
  layout: '写真を全面に＋左下に文字',
  summary: '店内や料理の写真を画面いっぱいに見せ、左下に白い見出し。写真の力でいちばん印象に残る案。良い写真があるお店向け。',
  colors: { bg: '#f7f4ef', accent: '#3f5d4a', ink: '#24221f' },
  fonts: { display: 'Shippori Mincho:600', text: 'Zen Kaku Gothic New:400;500', en: 'Cormorant Garamond:ital,wght@1,500' },
  css: `
.mv-b { position: relative; min-height: 100svh; display: grid; align-items: end; color: #fff; overflow: hidden; }
.mv-b__photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.06); animation: mv-b-in 2.4s var(--ease) both; }
@keyframes mv-b-in { to { transform: none; } }
.mv-b::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgb(0 0 0 / 0) 40%, rgb(0 0 0 / .55)); }
.mv-b__copy { position: relative; z-index: 1; padding-bottom: clamp(48px, 9vh, 112px); }
.mv-b h1 { font-size: clamp(40px, 6.4vw, 88px); line-height: 1.25; letter-spacing: .06em; text-shadow: 0 2px 24px rgb(0 0 0 / .25); }
.mv-b__lead { margin: var(--s-5) 0 var(--s-6); font-size: var(--t-lead); opacity: .92; }
.mv-b .btn--secondary { color: #fff; border-color: rgb(255 255 255 / .6); }
.is-still .mv-b__photo { animation: none; transform: none; }
@media (max-width: 639px) { .mv-b { min-height: 88svh; } .mv-b .btn--primary { display: none; } }
`,
  hero: ({ site, content, kit }) => `<section class="mv-b" aria-labelledby="mv-h">
  ${kit.img(content.hero.photo, content.hero.photoAlt, { cls: 'mv-b__photo', w: 1600, h: 1000, eager: true, reveal: false })}
  <div class="wrap mv-b__copy">
    <h1 id="mv-h" data-reveal>${content.hero.catch.map((l) => kit.nw(kit.esc(l))).join('<br>')}</h1>
    <p class="mv-b__lead" data-reveal style="--i: 1">${kit.esc(site.HOURS.days)} ${kit.esc(site.HOURS.time)}　${kit.esc(site.ADDRESS.access)}</p>
    <div class="btn-row" data-reveal style="--i: 2">${kit.btn(site.PRIMARY_ACTION.label, site.PRIMARY_ACTION.href, 'primary', site.PRIMARY_ACTION.icon)}${kit.btn('メニューを見る', '#menu', 'secondary', 'utensils')}</div>
  </div>
</section>`,
};
