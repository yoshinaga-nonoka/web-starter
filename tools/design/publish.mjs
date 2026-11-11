// Publish the design proposals (design/ over public/, as `npm run serve:design` shows them) to their own Cloudflare
// Worker, so the client and the team can open them on any device: https://<name>-design.<account>.workers.dev
// The real site is not touched. The pages say noindex, and the Worker answers X-Robots-Tag: noindex.
//
// usage: npm run design:publish            (run `npm run design` first; the first time, `npx wrangler login`)
//        npm run design:publish -- --dry   (only prepare .out/design-site/, do not upload)
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = join(ROOT, '.out/design-site');
const name = `${JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).name}-design`;
if (!existsSync(join(ROOT, 'design/index.html'))) { console.error('design/index.html がありません。先に npm run design を実行してください'); process.exit(1); }

rmSync(OUT, { recursive: true, force: true });
cpSync(join(ROOT, 'public'), OUT, { recursive: true });
// the proposals' pages, shots and the gallery; not their sources
cpSync(join(ROOT, 'design'), OUT, { recursive: true, filter: (src) => !/\.(mjs|json|py|md)$/.test(src) });
// not the real site's headers (its CSP is for the real site): the proposals are only kept out of search
writeFileSync(join(OUT, '_headers'), `/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(ROOT, '.out/wrangler.design.json'), JSON.stringify({
  name, compatibility_date: '2026-11-01', assets: { directory: './design-site' },
}, null, 2));
console.log(`用意しました: .out/design-site（Worker名 ${name}）`);
if (process.argv.includes('--dry')) process.exit(0);
execFileSync('npx', ['wrangler', 'deploy', '--config', join(ROOT, '.out/wrangler.design.json')], { stdio: 'inherit', cwd: join(ROOT, '.out') });
console.log('\n上の workers.dev のURLを共有してください（URLを知っている人だけが開けます。検索には出ません）');
