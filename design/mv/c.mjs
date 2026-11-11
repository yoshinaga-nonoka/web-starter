// メインビジュアル案C: 真ん中に大きな文字。まわりに丸い写真が浮かぶ。
export default {
  name: '真ん中の大きな文字',
  layout: '中央ぞろえ＋丸い写真',
  summary: '大きな丸ゴシックの見出しを真ん中に置き、まわりに丸く切り抜いた写真がゆっくり浮かぶ。やわらかく、親しみやすい案。',
  colors: { bg: '#fdf8ef', surface: '#f6ead6', accent: '#d0672f', ink: '#3a2e25' },
  fonts: { display: 'Zen Maru Gothic:700', text: 'Zen Maru Gothic:500', en: 'Fraunces:ital,wght@1,500' },
  css: `
.mv-c { position: relative; min-height: min(100svh, 940px); display: grid; place-items: center; text-align: center; padding: calc(var(--nav) + var(--s-8)) 0 var(--s-9); overflow: hidden; }
.mv-c h1 { position: relative; z-index: 1; font-size: clamp(40px, 7vw, 96px); line-height: 1.25; letter-spacing: .04em; }
.mv-c h1 span:last-child { color: var(--accent); }
.mv-c__lead { position: relative; z-index: 1; margin: var(--s-6) auto var(--s-7); color: var(--muted); font-size: var(--t-lead); }
.mv-c .btn-row { justify-content: center; position: relative; z-index: 1; }
.mv-c__dot { position: absolute; border-radius: 50%; overflow: hidden; animation: mv-c-float 7s var(--calm) infinite alternate; }
.mv-c__dot img { width: 100%; height: 100%; object-fit: cover; }
.mv-c__dot--1 { width: clamp(120px, 17vw, 240px); aspect-ratio: 1; left: 6%; top: 22%; }
.mv-c__dot--2 { width: clamp(90px, 12vw, 170px); aspect-ratio: 1; right: 8%; top: 18%; animation-delay: -2s; }
.mv-c__dot--3 { width: clamp(110px, 14vw, 200px); aspect-ratio: 1; right: 14%; bottom: 10%; animation-delay: -4s; }
.mv-c__sun { position: absolute; width: 46vmin; aspect-ratio: 1; border-radius: 50%; background: var(--surface); left: 50%; top: 52%; translate: -50% -50%; }
@keyframes mv-c-float { to { transform: translateY(-14px); } }
.is-still .mv-c__dot { animation: none; }
@media (max-width: 639px) { .mv-c { min-height: 0; padding-top: calc(var(--nav) + var(--s-9)); } .mv-c__dot--1 { left: -30px; top: 12%; } .mv-c__dot--3 { right: -20px; bottom: 4%; } .mv-c .btn--primary { display: none; } }
`,
  hero: ({ site, content, kit }) => `<section class="mv-c" aria-labelledby="mv-h">
  <i class="mv-c__sun" aria-hidden="true"></i>
  <span class="mv-c__dot mv-c__dot--1" aria-hidden="true"><img src="${content.hero.photo}" alt=""></span>
  <span class="mv-c__dot mv-c__dot--2" aria-hidden="true"><img src="${content.menu.items[0].photo}" alt=""></span>
  <span class="mv-c__dot mv-c__dot--3" aria-hidden="true"><img src="${content.about.photo}" alt=""></span>
  <div class="wrap">
    <h1 id="mv-h" data-reveal>${content.hero.catch.map((l) => `<span class="nw">${kit.esc(l)}</span>`).join('<br>')}</h1>
    <p class="mv-c__lead" data-reveal style="--i: 1">${kit.esc(site.HOURS.days)} ${kit.esc(site.HOURS.time)}<br>${kit.esc(site.ADDRESS.access)}</p>
    <div class="btn-row" data-reveal style="--i: 2">${kit.btn(site.PRIMARY_ACTION.label, site.PRIMARY_ACTION.href, 'primary', site.PRIMARY_ACTION.icon)}${kit.btn('メニューを見る', '#menu', 'secondary', 'utensils')}</div>
  </div>
</section>`,
};
