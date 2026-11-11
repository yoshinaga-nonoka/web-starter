// Google Fonts from THEME.fonts. Japanese fonts are large, so the top page loads only the characters its own source
// files can show (worked out at build time: a text edit needs no extra step). Pages with text from microCMS load all.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { THEME } from './site';

function family(f: { family: string; weights: string }) {
  const name = f.family.replace(/ /g, '+');
  return f.weights.includes('@') ? `family=${name}:${f.weights}` : `family=${name}:wght@${f.weights}`;
}
const FAMILIES = [THEME.fonts.display, THEME.fonts.text, THEME.fonts.en].map(family).join('&') + '&display=swap';

export const fullFontsUrl = `https://fonts.googleapis.com/css2?${FAMILIES}`;

/** Every file under src/ and public/js/: the characters the top page can show. */
function sources(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) sources(p, out);
    else if (/\.(astro|ts|js)$/.test(name)) out.push(p);
  }
  return out;
}

function subsetText(extra: string): string {
  const chars = new Set<string>(extra);
  for (const file of [...sources(join(process.cwd(), 'src')), ...sources(join(process.cwd(), 'public/js'))]) {
    for (const c of readFileSync(file, 'utf8')) if (c.codePointAt(0)! > 0x7e) chars.add(c);
  }
  for (let c = 0x21; c <= 0x7e; c++) chars.add(String.fromCharCode(c));
  chars.add(' ');
  return [...chars].filter((c) => !/\s/.test(c) || c === ' ').sort().join('');
}

/** The top page's fonts; `extra` adds text that comes from microCMS (the latest news titles). */
export function subsetFontsUrl(extra = ''): string {
  return `${fullFontsUrl}&text=${encodeURIComponent(subsetText(extra))}`;
}
