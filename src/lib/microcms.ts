// microCMS: the "news" list API (title, content as rich text, thumbnail, photos, category).
// The key is read at build time from .env locally, and from the build variables on Cloudflare.
// NEWS_FIXTURE=1 (npm run build:fixture) builds with the sample posts in tools/fixtures/news.json instead, for checking.

export type Image = { url: string; width?: number; height?: number };

export type News = {
  id: string;
  title: string;
  content?: string;
  /** 画像: the picture on cards and at the top of the article */
  thumbnail?: Image;
  /** 複数画像: photographs shown under the article */
  photos?: Image[];
  category?: string[] | string | { name?: string } | null;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  /** when the post's content was last republished */
  revisedAt?: string;
};

const ENDPOINT = 'news';
const domain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;

let cache: Promise<News[]> | undefined;

/** Every published article, newest first. Without the two variables the site builds with no articles. */
export function getAllNews(): Promise<News[]> {
  cache ??= load();
  return cache;
}

async function load(): Promise<News[]> {
  if (import.meta.env.NEWS_FIXTURE) {
    console.warn('[microCMS] NEWS_FIXTURE: tools/fixtures/news.json の見本記事で作ります（公開用には使わない）');
    return (await import('../../tools/fixtures/news.json')).default as News[];
  }
  if (!domain || !apiKey) {
    console.warn('[microCMS] MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY がないため、お知らせは0件で作ります');
    return [];
  }
  const items: News[] = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const url = `https://${domain}.microcms.io/api/v1/${ENDPOINT}?limit=${limit}&offset=${offset}&orders=-publishedAt`;
    const res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': apiKey } });
    // a wrong key stops the build, so a deploy never replaces the articles with an empty list
    if (!res.ok) throw new Error(`[microCMS] ${res.status} ${res.statusText}: ${await res.text()}`);
    const data = (await res.json()) as { contents: News[]; totalCount: number };
    items.push(...data.contents);
    if (offset + limit >= data.totalCount) break;
  }
  return items;
}

/** The category as one label, whether the field is a select, a text field or a reference. */
export function categoryOf(news: News): string | undefined {
  const c = news.category;
  if (!c) return undefined;
  if (Array.isArray(c)) return c[0];
  if (typeof c === 'string') return c;
  return c.name;
}

const dateFormat = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric' });

export function dateOf(news: News): { iso: string; label: string } {
  const iso = news.publishedAt ?? news.createdAt;
  return { iso, label: dateFormat.format(new Date(iso)) };
}

/** The picture for a card: the thumbnail, else the first photograph, else the first image in the text. */
export function coverOf(news: News): Image | undefined {
  return news.thumbnail ?? news.photos?.[0] ?? firstImageIn(news.content);
}

function firstImageIn(html = ''): Image | undefined {
  const tag = html.match(/<img\b[^>]*>/i)?.[0];
  const url = tag?.match(/\ssrc="([^"]+)"/i)?.[1];
  if (!tag || !url) return undefined;
  const num = (name: string) => Number(tag.match(new RegExp(`\\s${name}="(\\d+)"`, 'i'))?.[1]) || undefined;
  return { url: url.split('?')[0], width: num('width'), height: num('height') };
}

/** A microCMS image (imgix) as WebP at a given width, never enlarged past its own size; with a height, cropped to that shape. */
export function imageUrl(url: string, width: number, height?: number): string {
  // only microCMS's own images can be resized by URL (the sample posts use the site's own files)
  if (!url.startsWith('https://images.microcms-assets.io/')) return url;
  const params = new URLSearchParams({ w: String(width), fm: 'webp', q: '78' });
  if (height) {
    params.set('h', String(height));
    params.set('fit', 'crop');
  } else {
    params.set('fit', 'max');
  }
  return `${url}?${params}`;
}

/** The width an article's pictures are shown at, at most (news.css), and the width fetched for sharp screens. */
export const ARTICLE_IMAGE_WIDTH = 480;

/* The rich text from microCMS goes into the page as HTML, so it is cleaned first: only the tags and attributes the
   editor produces are kept, links go only to web, mail and phone addresses, and scripts, frames, forms, styles and
   event handlers are dropped (with their content for script and style). A second guard to the site's content security
   policy, should the microCMS account ever be misused. */
const ALLOWED_TAGS = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'sub', 'sup', 'mark', 'span', 'div',
  'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'figure', 'figcaption', 'img', 'hr', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td']);
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height'], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'],
};
const SAFE_URL = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i;
const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function sanitizeHtml(html = ''): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|template|noscript|textarea|select|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?([a-zA-Z][\w-]*)\b([^>]*)>/g, (tag: string, name: string, rest: string) => {
      const n = name.toLowerCase();
      if (!ALLOWED_TAGS.has(n)) return '';
      if (tag.startsWith('</')) return `</${n}>`;
      const allowed = ALLOWED_ATTRS[n] ?? [];
      const attrs: string[] = [];
      for (const m of rest.matchAll(/([a-zA-Z_:][-\w:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
        const key = m[1].toLowerCase();
        const value = (m[3] ?? m[4] ?? m[5] ?? '').replace(/&#x?0*(58|3a);?/gi, ':').trim();
        if (!allowed.includes(key)) continue;
        if ((key === 'href' || key === 'src') && !SAFE_URL.test(value)) continue;
        if (key === 'target' && value !== '_blank') continue;
        attrs.push(`${key}="${escapeAttr(value)}"`);
      }
      // a link that opens a new tab never hands that tab a handle back to this page
      if (n === 'a' && attrs.some((a) => a === 'target="_blank"')) {
        const i = attrs.findIndex((a) => a.startsWith('rel='));
        if (i >= 0) attrs.splice(i, 1);
        attrs.push('rel="noopener noreferrer"');
      }
      return `<${n}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;
    });
}

/** The article's rich text, cleaned (sanitizeHtml), its microCMS pictures fetched at twice their shown width as WebP. */
export function proseHtml(html = ''): string {
  return sanitizeHtml(html).replace(/<img\b[^>]*>/gi, (tag) =>
    tag
      .replace(/\ssrc="(https:\/\/images\.microcms-assets\.io\/[^"?]+)(?:\?[^"]*)?"/i,
        (_, url: string) => ` src="${imageUrl(url, ARTICLE_IMAGE_WIDTH * 2).replace(/&/g, '&amp;')}"`)
      .replace(/^<img\b/i, '<img decoding="async"'),
  );
}
