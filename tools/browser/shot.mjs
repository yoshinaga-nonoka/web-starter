// Screenshots of a page at several widths.
// usage: node tools/browser/shot.mjs <url> [--sizes 1440x900,1024x768,820x1180,768x1024,390x844,375x812]
//          [--out .out/shots] [--name top] [--full] [--scroll "#visit"] [--reduced] [--scale 1] [--wait 2500]
//   --full    the whole page, as screen-tall tiles taken while scrolling down (so scroll motion has played)
//   --scroll  scroll that element to the top before the shot
//   --as      the exact file to write (one size only), e.g. --sizes 1200x630 --as public/media/og.jpg
import { args, launch, sizes, sleep } from './cdp.mjs';

const a = args();
const url = a._[0];
if (!url) { console.error('usage: node tools/browser/shot.mjs <url> [--sizes 1440x900,390x844] [--full] [--scroll "#id"]'); process.exit(1); }
const out = a.out || '.out/shots';
const name = a.name || 'page';
const list = sizes(a.sizes || '1440x900,1024x768,820x1180,768x1024,390x844,375x812');

for (const [w, h] of list) {
  const page = await launch({ width: w, height: h, scale: +(a.scale || 1), reduced: !!a.reduced });
  try {
    await page.goto(url, +(a.wait || 2500));
    if (a.scroll) {
      await page.ev(`document.querySelector(${JSON.stringify(a.scroll)})?.scrollIntoView()`);
      await sleep(1500);
    }
    if (!a.full) { console.log(await page.shot(a.as || `${out}/${name}-${w}.jpg`)); continue; }
    const total = await page.ev('document.documentElement.scrollHeight');
    for (let y = 0, i = 0; y < total; y += h, i++) {
      await page.ev(`scrollTo(0, ${y})`);
      await sleep(1200);
      console.log(await page.shot(`${out}/${name}-${w}-${String(i).padStart(2, '0')}.jpg`));
    }
  } finally { page.close(); }
}
