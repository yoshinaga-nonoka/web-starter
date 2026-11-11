// Open pages the way a visitor does (PC and phone, scrolled to the bottom) and report what broke:
// console errors, CSP refusals, failed requests and images that did not load.
// usage: node tools/browser/audit.mjs <base-url> [paths…] [--sizes 1440x900,390x844]
//   e.g. node tools/browser/audit.mjs https://hidamari-cafe-sapporo.com / /news/
// With `npm run preview:headers` (wrangler, port 8788) the CSP in public/_headers applies locally as well.
// Exit code 1 when anything is reported.
import { args, launch, sizes, sleep } from './cdp.mjs';

const a = args();
const [base, ...paths] = a._;
if (!base) { console.error('usage: node tools/browser/audit.mjs <base-url> [paths…]'); process.exit(1); }
const list = paths.length ? paths : ['/', '/news/', '/404-check-page'];
let bad = 0;

for (const [w, h] of sizes(a.sizes || '1440x900,390x844')) {
  const page = await launch({ width: w, height: h, log: true });
  try {
    for (const path of list) {
      page.log.length = 0;
      page.failed.length = 0;
      await page.goto(new URL(path, base).href, 2500);
      const broken = await page.ev(`(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); }
        await new Promise(r => setTimeout(r, 1500));
        return [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src);
      })()`);
      await sleep(800);
      const problems = [...page.log.filter(m => /^(error|warning)|Content Security|Refused|exception/i.test(m)), ...page.failed.map(f => 'failed: ' + f), ...broken.map(s => 'image: ' + s)]
        // the 404 check page is meant to 404
        .filter(m => !(path.startsWith('/404') && /404/.test(m)));
      bad += problems.length;
      console.log(`${problems.length ? '✗' : '✓'} ${w}  ${path}`);
      for (const p of problems) console.log('    ' + p);
    }
  } finally { page.close(); }
}
process.exit(bad ? 1 : 0);
