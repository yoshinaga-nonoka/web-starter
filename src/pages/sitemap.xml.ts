// The sitemap for search engines: the top page, the news list and every post, on the site's own domain.
import type { APIRoute } from 'astro';
import { getAllNews } from '../lib/microcms';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://example.com');
  const news = await getAllNews();
  const latest = news[0] ? (news[0].revisedAt ?? news[0].updatedAt ?? news[0].publishedAt ?? news[0].createdAt) : undefined;
  const pages: { path: string; lastmod?: string }[] = [
    { path: '/', lastmod: latest },
    { path: '/news/', lastmod: latest },
    ...news.map((n) => ({ path: `/news/${n.id}/`, lastmod: n.revisedAt ?? n.updatedAt ?? n.publishedAt ?? n.createdAt })),
  ];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map((p) => `  <url><loc>${new URL(p.path, base).href}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
