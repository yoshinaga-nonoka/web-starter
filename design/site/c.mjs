// サイト全体案C: 写真を大きく。画面幅いっぱいの写真に、文字のカードが重なる。
export default {
  name: '大きな写真',
  layout: '画面幅の写真＋重なる文字のカード',
  summary: 'メニューと紹介を、画面幅いっぱいの写真で見せる。文字は写真に少し重なる白いカードに。写真が主役の、雑誌の特集ページのような案。',
  css: `
.sc { padding: var(--s-10) 0; }
.sc__news { display: flex; gap: var(--s-6); align-items: baseline; flex-wrap: wrap; border-block: 1px solid var(--line); padding: var(--s-5) 0; }
.sc__news .ttl { margin: 0; flex-direction: row; display: flex; gap: var(--s-4); align-items: baseline; }
.sc__news .ttl__ja { font-size: var(--t-h3); }
.sc__news ul { flex: 1; display: grid; gap: var(--s-2); min-width: 280px; }
.sc__news a { display: flex; gap: var(--s-5); }
.sc__news time { color: var(--muted); font-size: var(--t-small); white-space: nowrap; }
.sc__menu { display: grid; gap: var(--s-9); }
.sc__item { position: relative; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); align-items: center; }
.sc__item .frame { grid-column: 1 / 9; grid-row: 1; aspect-ratio: 16 / 10; }
.sc__card { grid-column: 8 / 13; grid-row: 1; background: var(--bg); padding: var(--s-7) var(--s-6); border-radius: var(--radius); box-shadow: 0 20px 40px -24px color-mix(in srgb, var(--ink) 45%, transparent); position: relative; }
.sc__item:nth-child(even) .frame { grid-column: 5 / 13; }
.sc__item:nth-child(even) .sc__card { grid-column: 1 / 6; }
.sc__card h3 { font-size: var(--t-h2); margin-bottom: var(--s-3); }
.sc__card span { font-family: var(--font-en); font-style: italic; color: var(--accent); font-size: 20px; }
.sc__wide { position: relative; height: min(80svh, 720px); }
.sc__wide .frame { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 0; }
.sc__wide .wrap { position: relative; height: 100%; display: grid; align-items: end; padding-bottom: var(--s-8); }
.sc__wide .sc__card { max-width: 520px; }
.sc__access { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s-8); align-items: end; }
.sc__access p { font-size: var(--t-lead); }
@media (max-width: 959px) {
  .sc__item .frame, .sc__item:nth-child(even) .frame { grid-column: 1 / -1; }
  .sc__card, .sc__item:nth-child(even) .sc__card { grid-column: 2 / 12; grid-row: 2; margin-top: -64px; }
  .sc__access { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 639px) { .sc { padding: var(--s-8) 0; } .sc__menu { gap: var(--s-7); } .sc__card { padding: var(--s-6) var(--s-5); } .sc__wide { height: 70svh; } .sc__news a { flex-direction: column; gap: 0; } }
`,
  sections: ({ site, content, kit }) => `<section class="sc" id="news" aria-labelledby="news-h" style="padding-bottom: 0"><div class="wrap sc__news">
  ${kit.title(site.section('news'), { id: 'news-h' })}
  <ul>${content.news.map((n) => `<li><a href="/news/${n.id}/"><time>${n.date}</time><span>${kit.esc(n.title)}</span></a></li>`).join('')}</ul>
  <a class="more" href="/news/"><span>一覧を見る</span><span class="more__ring">${kit.icon('arrow-right')}</span></a>
</div></section>
<section class="sc" id="menu" aria-labelledby="menu-h"><div class="wrap">
  ${kit.title(site.section('menu'), { id: 'menu-h' })}
  <ul class="sc__menu">${content.menu.items.map((m, i) => `<li class="sc__item">${kit.img(m.photo, m.name, { w: 1280, h: 800 })}<div class="sc__card" data-reveal><span>No.${i + 1}</span><h3>${kit.esc(m.name)}</h3><p class="lead">${kit.esc(m.note)}</p></div></li>`).join('')}</ul>
</div></section>
<section class="sc__wide" id="about" aria-labelledby="about-h">
  ${kit.img(content.about.photo, 'お店の様子', { w: 1600, h: 900 })}
  <div class="wrap"><div class="sc__card" data-reveal>${kit.title(site.section('about'), { id: 'about-h' })}<p class="lead">${content.about.body.map(kit.esc).join('')}</p></div></div>
</section>
<section class="sc" id="access" aria-labelledby="access-h"><div class="wrap sc__access">
  <div>${kit.title(site.section('access'), { id: 'access-h' })}<p data-reveal>${kit.esc(site.ADDRESS_TEXT)} ${kit.esc(site.ADDRESS.building)}<br><small>${kit.esc(site.ADDRESS.access)}</small></p></div>
  <div data-reveal><p>${kit.esc(site.HOURS.days)}　${kit.esc(site.HOURS.time)}</p><div style="margin-top: var(--s-5)">${kit.btn('Googleマップで経路を見る', site.LINKS.maps, 'primary', 'map-pin')}</div></div>
</div></section>`,
};
