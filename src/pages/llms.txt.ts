// llms.txt: the business in a few plain lines for AI assistants (the same facts as the pages and the structured data).
import type { APIRoute } from 'astro';
import { ADDRESS, ADDRESS_TEXT, HOURS, LINKS, SECTIONS, SITE } from '../lib/site';
import { dateOf, getAllNews } from '../lib/microcms';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE.url);
  const url = (p: string) => new URL(p, base).href;
  const news = (await getAllNews()).slice(0, 5);
  const lines = [
    `- 名前: ${SITE.name}${SITE.alternateNames.length ? `（${SITE.alternateNames.join('、')}）` : ''}`,
    `- 住所: 〒${ADDRESS.postalCode} ${ADDRESS_TEXT}${ADDRESS.building ? ` ${ADDRESS.building}` : ''}`,
    `- アクセス: ${ADDRESS.access}`,
    `- 営業時間: ${HOURS.days} ${HOURS.time}${HOURS.note ? `（${HOURS.note}）` : ''}`,
    SITE.offers.length && `- 提供しているもの: ${SITE.offers.join('、')}`,
    SITE.amenities.length && `- 設備: ${SITE.amenities.join('、')}`,
    LINKS.tel && `- 電話: ${LINKS.tel}`,
    LINKS.instagram && `- Instagram: ${LINKS.instagram}`,
    LINKS.reserve && `- 予約: ${LINKS.reserve}`,
    LINKS.order && `- 注文: ${LINKS.order}`,
  ].filter(Boolean);
  const body = `# ${SITE.name}

> ${SITE.description}

## 基本情報
${lines.join('\n')}

## ページ
- [トップページ](${url('/')}): ${SECTIONS.map((s) => s.ja).join('、')}
- [お知らせ](${url('/news/')})
${LINKS.maps ? `- [地図（Googleマップ）](${LINKS.maps})\n` : ''}${news.length ? `\n## 最近のお知らせ\n${news.map((n) => `- [${n.title.trim()}](${url(`/news/${n.id}/`)})（${dateOf(n).label}）`).join('\n')}\n` : ''}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
