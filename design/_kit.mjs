// Helpers for writing design proposals (design/<round>/<x>.mjs). They make the same markup as the site's own
// components, so a chosen proposal moves into src/ with little rewriting.
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);

/** Line icons: the same shapes as src/components/Icon.astro (read from it, so the two never drift). */
const iconSrc = readFileSync(new URL('src/components/Icon.astro', root), 'utf8');
const shapes = Object.fromEntries([...iconSrc.matchAll(/^\s*'?([\w-]+)'?:\s*'(<[^']+)',?$/gm)].map((m) => [m[1], m[2]]));
export const icon = (name, cls = '') =>
  `<svg class="icon icon--${name} ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${shapes[name] ?? ''}</svg>`;

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A button, as the site makes them (.btn--primary / --secondary / --light). External links open in a new tab. */
export const btn = (label, href, kind = 'primary', iconName = '') =>
  `<a class="btn btn--${kind}" href="${esc(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${iconName ? icon(iconName) : ''}${esc(label)}</a>`;

/** A section's title, as SectionTitle.astro makes it: the small English name with its mark, the Japanese name. */
export const title = (s, { id, tag = 'h2', cls = '' } = {}) =>
  `<${tag} class="ttl ${cls}"${id ? ` id="${id}"` : ''} data-reveal><span class="ttl__en"><span class="ttl__mark" aria-hidden="true"></span><span lang="en">${esc(s.en)}</span></span><span class="ttl__ja">${esc(s.ja)}</span></${tag}>`;

/** A photograph (lazy below the first screen). */
export const img = (src, alt, { cls = 'frame', w = 800, h = 600, eager = false, reveal = true } = {}) =>
  `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? '' : ' loading="lazy"'}${reveal ? ' data-reveal="photo"' : ''}>`;

/** Keep a phrase on one line (Safari has no word-break: auto-phrase). */
export const nw = (...parts) => parts.map((p) => `<span class="nw">${p}</span>`).join('');
