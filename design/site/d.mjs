// サイト全体案D: 縦書きの見出しを右端に。ポスターのように大きな数字と文字。
export default {
  name: '縦書きの見出し',
  layout: '右端に縦書きの見出し＋大きな文字',
  summary: '各セクションの右端に縦書きの大きな見出しを置き、営業時間は大きな数字で見せる。紹介だけ濃い色の帯にして、ページに強弱をつける。いちばん大胆な案。',
  css: `
.sd { padding: var(--s-10) 0; }
.sd__grid { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--s-8); }
.sd__v { writing-mode: vertical-rl; font-family: var(--font-display); font-size: clamp(36px, 4.4vw, 60px); letter-spacing: .18em; line-height: 1.2; }
.sd__v small { display: block; font-family: var(--font-en); font-style: italic; font-size: 18px; letter-spacing: .04em; color: var(--accent); margin-inline-start: var(--s-3); }
.sd__news li { display: grid; grid-template-columns: 7em minmax(0, 1fr); gap: var(--s-5); padding: var(--s-5) 0; border-bottom: 1px solid var(--line); }
.sd__news time { font-family: var(--font-en); font-size: 22px; color: var(--accent); line-height: 1.4; }
.sd__menu { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-6); }
.sd__menu .frame { aspect-ratio: 3 / 4; border-radius: 0; margin-bottom: var(--s-4); }
.sd__menu h3 { font-size: var(--t-h3); }
.sd__menu p { color: var(--muted); font-size: var(--t-small); }
.sd--band { background: var(--inv-bg); color: var(--inv-ink); --ink: var(--inv-ink); --muted: color-mix(in srgb, var(--inv-ink) 70%, transparent); --line: color-mix(in srgb, var(--inv-ink) 18%, transparent); }
.sd--band .sd__v small { color: var(--inv-ink); opacity: .7; }
.sd__about { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s-8); align-items: center; }
.sd__about h3 { font-size: var(--t-h2); line-height: 1.6; margin-bottom: var(--s-5); }
.sd__about .frame { aspect-ratio: 4 / 5; }
.sd__access .sd__big { font-family: var(--font-en); font-size: clamp(56px, 9vw, 128px); line-height: 1; letter-spacing: -.01em; }
.sd__access p { font-size: var(--t-lead); margin-top: var(--s-4); }
@media (max-width: 959px) { .sd__menu, .sd__about { grid-template-columns: minmax(0, 1fr); } .sd__menu { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 639px) {
  .sd { padding: var(--s-8) 0; }
  .sd__grid { grid-template-columns: minmax(0, 1fr); gap: var(--s-5); }
  .sd__v { writing-mode: horizontal-tb; order: -1; font-size: 32px; letter-spacing: .08em; }
  .sd__v small { display: inline; margin: 0 0 0 var(--s-3); }
  .sd__menu { grid-template-columns: minmax(0, 1fr); }
  .sd__news li { grid-template-columns: minmax(0, 1fr); gap: 0; }
}
`,
  sections: ({ site, content, kit }) => {
    const v = (id) => { const s = site.section(id); return `<h2 class="sd__v" id="${id}-h" data-reveal>${kit.esc(s.ja)}<small lang="en">${kit.esc(s.en)}</small></h2>`; };
    return `<section class="sd" id="news" aria-labelledby="news-h"><div class="wrap sd__grid">
  <ul class="sd__news">${content.news.map((n, i) => `<li data-reveal style="--i: ${i}"><time>${n.date}</time><a href="/news/${n.id}/">${kit.esc(n.title)}</a></li>`).join('')}</ul>${v('news')}
</div></section>
<section class="sd" id="menu" aria-labelledby="menu-h" style="padding-top: 0"><div class="wrap sd__grid">
  <ul class="sd__menu">${content.menu.items.map((m, i) => `<li data-reveal style="--i: ${i}">${kit.img(m.photo, m.name, { w: 600, h: 800, reveal: false })}<h3>${kit.esc(m.name)}</h3><p>${kit.esc(m.note)}</p></li>`).join('')}</ul>${v('menu')}
</div></section>
<section class="sd sd--band" id="about" aria-labelledby="about-h"><div class="wrap sd__grid">
  <div class="sd__about">${kit.img(content.about.photo, 'お店の様子', { w: 800, h: 1000 })}<div><h3 data-reveal>${kit.esc(content.about.heading)}</h3>${content.about.body.map((p) => `<p class="lead" data-reveal>${kit.esc(p)}</p>`).join('')}</div></div>${v('about')}
</div></section>
<section class="sd" id="access" aria-labelledby="access-h"><div class="wrap sd__grid">
  <div class="sd__access" data-reveal><p class="sd__big">${kit.esc(site.HOURS.time)}</p><p>${kit.esc(site.HOURS.days)}</p><p>${kit.esc(site.ADDRESS_TEXT)} ${kit.esc(site.ADDRESS.building)}<br><small>${kit.esc(site.ADDRESS.access)}</small></p><div style="margin-top: var(--s-6)">${kit.btn('Googleマップで経路を見る', site.LINKS.maps, 'primary', 'map-pin')}</div></div>${v('access')}
</div></section>`;
  },
};
