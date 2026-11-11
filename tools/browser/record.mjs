// A smooth video of a page's CSS motion (an opening, a hero), for showing motion ideas.
// Instead of filming in real time, every animation (page and its iframes) is paused and stepped to each frame's time,
// so the result is the same on every run and on a slow machine.
// usage: node tools/browser/record.mjs <url> [--size 1280x800] [--secs 6] [--fps 30] [--out .out/motion.mp4]
//          [--start 0]   (ms to skip at the beginning)
// Needs ffmpeg for the mp4; without it the frames stay in <out>-frames/. Also writes a contact sheet (<out>-frames.jpg).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { args, launch, sizes } from './cdp.mjs';

const a = args();
const url = a._[0];
if (!url) { console.error('usage: node tools/browser/record.mjs <url> [--size 1280x800] [--secs 6] [--fps 30] [--out .out/motion.mp4]'); process.exit(1); }
const [[w, h]] = sizes(a.size || '1280x800');
const fps = +(a.fps || 30);
const secs = +(a.secs || 6);
const start = +(a.start || 0);
const out = a.out || '.out/motion.mp4';
const dir = out.replace(/\.mp4$/, '') + '-frames';
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const page = await launch({ width: w, height: h });
try {
  await page.goto(url, +(a.wait || 2500));
  const n = Math.round(secs * fps);
  for (let i = 0; i <= n; i++) {
    const t = start + (i * 1000) / fps;
    await page.ev(`(async () => {
      const docs = [document, ...[...document.querySelectorAll('iframe')].map(f => { try { return f.contentDocument; } catch { return null; } }).filter(Boolean)];
      docs.forEach(d => d.getAnimations().forEach(an => { an.pause(); an.currentTime = ${t}; }));
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    })()`);
    await page.shot(`${dir}/f${String(i).padStart(4, '0')}.jpg`);
  }
  console.log('frames', n + 1, '→', dir);
} finally { page.close(); }

try {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', `${dir}/f%04d.jpg`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', out]);
  // a contact sheet: 8 frames across the run
  const every = Math.max(1, Math.floor((secs * fps) / 8));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${dir}/f%04d.jpg`, '-vf', `select=not(mod(n\\,${every})),scale=480:-1,tile=4x2`,
    '-frames:v', '1', out.replace(/\.mp4$/, '') + '-frames.jpg']);
  console.log(out);
} catch (e) {
  console.warn('ffmpeg がないため、mp4 は作りませんでした（コマ画像は残っています）', e.message);
}
