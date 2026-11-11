// サイト全体案B: セクションごとにやわらかい色の面。情報は白いお皿のようなカードに。
export default {
  name: '色の面とカード',
  layout: '色の面＋白いカード',
  summary: 'セクションごとに淡い色の面を敷き、情報は角の丸い白いカードにのせる。メニューは3枚のカード、アクセスは地図ボタンつきの大きなカード。明るく親しみやすい案。',
  css: `
.sb { padding: var(--s-9) 0; }
.sb__panel { border-radius: calc(var(--radius) * 2); padding: clamp(32px, 5vw, 72px); }
.sb--tint1 .sb__panel { background: color-mix(in srgb, var(--accent) 10%, var(--bg)); }
.sb--tint2 .sb__panel { background: var(--surface); }
.sb--tint3 .sb__panel { background: color-mix(in srgb, #6c8a6e 14%, var(--bg)); }
.sb .ttl { text-align: center; justify-items: center; }
.sb__plate { background: #fff; border-radius: var(--radius); box-shadow: 0 10px 30px -18px color-mix(in srgb, var(--ink) 40%, transparent); }
.sb__news { max-width: 820px; margin-inline: auto; padding: var(--s-3) var(--s-6); }
.sb__news a { display: grid; grid-template-columns: 8em minmax(0, 1fr) auto; gap: var(--s-4); align-items: center; padding: var(--s-5) 0; }
.sb__news li + li { border-top: 1px dashed var(--line-strong); }
.sb__news time { color: var(--accent); font-size: var(--t-small); font-weight: 500; }
.sb__cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-5); }
.sb__cards li { padding: var(--s-4) var(--s-4) var(--s-6); text-align: center; transition: transform .3s var(--ease); }
.sb__cards li:hover { transform: translateY(-4px); }
.sb__cards .frame { aspect-ratio: 1; border-radius: 50%; width: 72%; margin: var(--s-4) auto var(--s-5); }
.sb__cards h3 { font-size: var(--t-h3); }
.sb__cards p { color: var(--muted); font-size: var(--t-small); margin-top: var(--s-2); }
.sb__about { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s-7); align-items: center; }
.sb__about .frame { aspect-ratio: 1; border-radius: 50% 50% var(--radius) var(--radius); }
.sb__about h3 { font-size: var(--t-h2); margin-bottom: var(--s-5); }
.sb__access { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s-6); padding: var(--s-7); max-width: 960px; margin-inline: auto; }
.sb__access h3 { display: flex; align-items: center; gap: var(--s-2); font-size: var(--t-small); color: var(--muted); font-family: var(--font-text); margin-bottom: var(--s-2); }
.sb__access p { font-size: var(--t-lead); }
@media (max-width: 959px) { .sb__cards { grid-template-columns: minmax(0, 1fr); } .sb__about, .sb__access { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 639px) { .sb { padding: var(--s-5) 0; } .sb .wrap { padding-inline: 12px; } .sb__panel { padding: var(--s-7) var(--s-4); } .sb__news { padding: var(--s-2) var(--s-4); } .sb__news a { grid-template-columns: minmax(0, 1fr) auto; } .sb__news time { grid-column: 1 / -1; } .sb__access { padding: var(--s-5); } }
`,
  sections: ({ site, content, kit }) => `<section class="sb sb--tint1" id="news" aria-labelledby="news-h"><div class="wrap"><div class="sb__panel">
  ${kit.title(site.section('news'), { id: 'news-h' })}
  <ul class="sb__plate sb__news" data-reveal>${content.news.map((n) => `<li><a href="/news/${n.id}/"><time>${n.date}</time><span>${kit.esc(n.title)}</span>${kit.icon('chevron-right')}</a></li>`).join('')}</ul>
</div></div></section>
<section class="sb sb--tint2" id="menu" aria-labelledby="menu-h"><div class="wrap"><div class="sb__panel">
  ${kit.title(site.section('menu'), { id: 'menu-h' })}
  <ul class="sb__cards">${content.menu.items.map((m, i) => `<li class="sb__plate" data-reveal style="--i: ${i}">${kit.img(m.photo, m.name, { w: 400, h: 400, reveal: false })}<h3>${kit.esc(m.name)}</h3><p>${kit.esc(m.note)}</p></li>`).join('')}</ul>
</div></div></section>
<section class="sb sb--tint3" id="about" aria-labelledby="about-h"><div class="wrap"><div class="sb__panel">
  ${kit.title(site.section('about'), { id: 'about-h' })}
  <div class="sb__about">${kit.img(content.about.photo, 'お店の様子', { w: 800, h: 800 })}<div><h3 data-reveal>${kit.esc(content.about.heading)}</h3>${content.about.body.map((p) => `<p class="lead" data-reveal>${kit.esc(p)}</p>`).join('')}</div></div>
</div></div></section>
<section class="sb sb--tint1" id="access" aria-labelledby="access-h"><div class="wrap"><div class="sb__panel">
  ${kit.title(site.section('access'), { id: 'access-h' })}
  <div class="sb__plate sb__access" data-reveal>
    <div><h3>${kit.icon('map-pin')}場所</h3><p>${kit.esc(site.ADDRESS_TEXT)}<br>${kit.esc(site.ADDRESS.building)}</p><p><small>${kit.esc(site.ADDRESS.access)}</small></p></div>
    <div><h3>${kit.icon('clock')}営業時間</h3><p>${kit.esc(site.HOURS.days)}<br>${kit.esc(site.HOURS.time)}</p><div style="margin-top: var(--s-5)">${kit.btn('地図を開く', site.LINKS.maps, 'primary', 'map-pin')}</div></div>
  </div>
</div></div></section>`,
};
