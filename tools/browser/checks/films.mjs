// The looping films play on a phone as they come on screen (site.js starts each one when 15% of it is visible) (with and without reduced motion; only the
// visitor's own stop switch keeps them still). Prints play/stop for each film at the top, at #place and at #visit.
// usage: node tools/browser/checks/films.mjs [url]   (default http://127.0.0.1:5481/)
import { launch, sleep } from '../cdp.mjs';

const U = process.argv[2] || 'http://127.0.0.1:5481/';
let ok = true;
for (const reduced of [false, true]) {
  const p = await launch({ width: 390, height: 844, scale: 2, reduced, autoplay: true });
  try {
    await p.send('Page.navigate', { url: U });
    await sleep(reduced ? 2500 : 7000);   // the opening plays first without reduced motion
    const films = () => p.ev(`Object.fromEntries([...document.querySelectorAll('video[data-autoplay]')]
      .filter(v => { const b = v.getBoundingClientRect(); return (Math.min(b.bottom, innerHeight) - Math.max(b.top, 0)) / b.height >= 0.15; })
      .map(v => [v.currentSrc.split('/').pop() || v.src.split('/').pop(), v.paused ? 'stop' : 'play']))`);
    for (const where of ['top', '#place', '#visit']) {
      if (where !== 'top') { await p.ev(`document.querySelector('${where}').scrollIntoView()`); await sleep(2500); }
      const seen = await films();
      const fine = Object.values(seen).every(s => s === 'play');
      ok &&= fine;
      console.log(`${fine ? '✓' : '✗'} ${reduced ? '動きを減らす' : '通常        '} ${where.padEnd(7)} ${JSON.stringify(seen)}`);
    }
  } finally { p.close(); }
}
process.exit(ok ? 0 : 1);
