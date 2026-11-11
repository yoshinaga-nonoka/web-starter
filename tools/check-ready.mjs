// Before publishing: is anything of the template left, and do the machine-readable parts hold together?
// Reads the build (dist/): run `npm run build` first. Exit code 1 when something must be fixed.
//   - 【要差し替え】, placeholder images, example.com left in any page or file
//   - every page has a title, a description, a canonical URL; the JSON-LD parses
//   - og.jpg (1200x630) and logo.png exist
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = 'dist';
if (!existsSync(dist)) { console.error('dist/ がありません。先に npm run build を実行してください'); process.exit(1); }
const files = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } })(dist);

const problems = [];
const warn = (file, msg) => problems.push(`${relative(dist, file) || file}: ${msg}`);
for (const file of files.filter((f) => /\.(html|xml|txt)$/.test(f))) {
  const s = readFileSync(file, 'utf8');
  if (s.includes('【要差し替え】')) warn(file, '「【要差し替え】」が残っています（src/lib/site.ts や index.astro）');
  if (/placeholder-[\w-]+\.svg/.test(s)) warn(file, '見本の画像（placeholder-*.svg）を使っています');
  if (s.includes('https://example.com')) warn(file, 'example.com が残っています（SITE.url または SITE_URL）');
  if (!file.endsWith('.html')) continue;
  if (!/<title>[^<]+<\/title>/.test(s)) warn(file, 'title がありません');
  if (!/<meta name="description" content="[^"]+"/.test(s)) warn(file, 'description がありません');
  if (!s.includes('name="robots" content="noindex"') && !/rel="canonical"/.test(s)) warn(file, 'canonical がありません');
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { warn(file, `JSON-LD が壊れています: ${e.message}`); }
  }
}
for (const need of ['media/og.jpg', 'media/logo.png']) if (!existsSync(join(dist, need))) warn(need, 'ありません（README の「OGP画像とロゴ」）');

if (problems.length) {
  console.log(`公開前に直すもの（${problems.length}件）:`);
  for (const p of problems) console.log('  ✗ ' + p);
  process.exit(1);
}
console.log('✓ テンプレートの残りはありません。title・description・canonical・JSON-LD・OGP画像もそろっています');
