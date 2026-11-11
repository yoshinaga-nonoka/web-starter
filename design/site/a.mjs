// サイト全体案A: 余白と罫線の編集。各セクションに細い大きな番号。
export default {
  name: '余白と罫線',
  layout: '左に見出し＋右に内容（雑誌のような2段組み）',
  summary: '広い余白と細い罫線で組み、各セクションに01〜04の大きな番号。写真は控えめに置き、文字を読ませる落ち着いた案。',
  css: `
.sa { padding: var(--s-10) 0; border-top: 1px solid var(--line); }
.sa__grid { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: var(--s-8); }
.sa__head { position: sticky; top: calc(var(--nav) + var(--s-6)); align-self: start; }
.sa__no { display: block; font-family: var(--font-en); font-style: italic; font-size: clamp(56px, 7vw, 104px); line-height: 1; color: var(--accent); opacity: .25; margin-bottom: var(--s-4); }
.sa .ttl { margin: 0; }
.sa__rows { border-top: 1px solid var(--ink); }
.sa__rows a { display: grid; grid-template-columns: 8em minmax(0, 1fr) auto; gap: var(--s-4); padding: var(--s-5) 0; border-bottom: 1px solid var(--line); align-items: center; }
.sa__rows time { color: var(--muted); font-size: var(--t-small); }
.sa__menu { display: grid; gap: var(--s-7); }
.sa__menu li { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: var(--s-6); align-items: center; padding-bottom: var(--s-7); border-bottom: 1px solid var(--line); }
.sa__menu h3 { font-size: var(--t-h3); margin-bottom: var(--s-2); }
.sa__menu .frame { aspect-ratio: 1; }
.sa__about h3 { font-size: var(--t-h2); line-height: 1.5; margin-bottom: var(--s-6); }
.sa__about .frame { margin-top: var(--s-7); aspect-ratio: 16 / 9; }
.sa__facts { display: grid; gap: 0; border-top: 1px solid var(--ink); }
.sa__facts div { display: grid; grid-template-columns: 9em minmax(0, 1fr); padding: var(--s-5) 0; border-bottom: 1px solid var(--line); }
.sa__facts dt { color: var(--muted); font-size: var(--t-small); }
@media (max-width: 959px) { .sa__grid { grid-template-columns: minmax(0, 1fr); gap: var(--s-6); } .sa__head { position: static; } }
@media (max-width: 639px) { .sa { padding: var(--s-8) 0; } .sa__menu li { grid-template-columns: 96px minmax(0, 1fr); gap: var(--s-4); } .sa__rows a { grid-template-columns: minmax(0, 1fr) auto; } .sa__rows time { grid-column: 1 / -1; } .sa__facts div { grid-template-columns: minmax(0, 1fr); } }
`,
  sections: ({ site, content, kit }) => {
    const head = (id, no) => `<div class="sa__head"><span class="sa__no" aria-hidden="true">${no}</span>${kit.title(site.section(id), { id: `${id}-h` })}</div>`;
    return `<section class="sa" id="news" aria-labelledby="news-h"><div class="wrap sa__grid">${head('news', '01')}
  <ul class="sa__rows">${content.news.map((n, i) => `<li data-reveal style="--i: ${i}"><a href="/news/${n.id}/"><time>${n.date}</time><span>${kit.esc(n.title)}</span>${kit.icon('arrow-right')}</a></li>`).join('')}</ul>
</div></section>
<section class="sa" id="menu" aria-labelledby="menu-h"><div class="wrap sa__grid">${head('menu', '02')}
  <div><p class="lead" data-reveal style="margin-bottom: var(--s-7)">${kit.esc(content.menu.lead)}</p>
  <ul class="sa__menu">${content.menu.items.map((m, i) => `<li data-reveal style="--i: ${i}">${kit.img(m.photo, m.name, { w: 400, h: 400, reveal: false })}<div><h3>${kit.esc(m.name)}</h3><p class="lead">${kit.esc(m.note)}</p></div></li>`).join('')}</ul></div>
</div></section>
<section class="sa" id="about" aria-labelledby="about-h"><div class="wrap sa__grid">${head('about', '03')}
  <div class="sa__about"><h3 data-reveal>${kit.esc(content.about.heading)}</h3>${content.about.body.map((p) => `<p class="lead" data-reveal>${kit.esc(p)}</p>`).join('')}${kit.img(content.about.photo, 'お店の様子', { w: 1200, h: 675 })}</div>
</div></section>
<section class="sa" id="access" aria-labelledby="access-h"><div class="wrap sa__grid">${head('access', '04')}
  <div><dl class="sa__facts" data-reveal>
    <div><dt>場所</dt><dd>〒${site.ADDRESS.postalCode}<br>${kit.esc(site.ADDRESS_TEXT)} ${kit.esc(site.ADDRESS.building)}<br><small>${kit.esc(site.ADDRESS.access)}</small></dd></div>
    <div><dt>営業時間</dt><dd>${kit.esc(site.HOURS.days)}<br>${kit.esc(site.HOURS.time)}${site.HOURS.note ? `<br><small>${kit.esc(site.HOURS.note)}</small>` : ''}</dd></div>
  </dl><div style="margin-top: var(--s-6)">${kit.btn('Googleマップで経路を見る', site.LINKS.maps, 'secondary', 'map-pin')}</div></div>
</div></section>`;
  },
};
