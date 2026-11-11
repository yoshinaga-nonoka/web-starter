// Run a script in the page and print what it returns (sizes, positions, computed styles…), at one or more widths.
// usage: node tools/browser/measure.mjs <url> (--expr "<js>" | --file q.js) [--sizes 1440x900,390x844] [--reduced] [--wait 3500]
// The script is an expression; it may be a promise. Return plain data, e.g.
//   --expr "[...document.querySelectorAll('section')].map(s => [s.id, Math.round(s.getBoundingClientRect().height)])"
import { readFileSync } from 'node:fs';
import { args, launch, sizes } from './cdp.mjs';

const a = args();
const url = a._[0];
const expr = a.expr || (a.file && readFileSync(a.file, 'utf8'));
if (!url || !expr) { console.error('usage: node tools/browser/measure.mjs <url> --expr "<js>" | --file q.js [--sizes 1440x900]'); process.exit(1); }

for (const [w, h] of sizes(a.sizes || '1440x900')) {
  const page = await launch({ width: w, height: h, reduced: !!a.reduced });
  try {
    await page.goto(url, +(a.wait || 3500));
    console.log(`── ${w}x${h}`);
    console.log(JSON.stringify(await page.ev(expr), null, 1));
  } finally { page.close(); }
}
