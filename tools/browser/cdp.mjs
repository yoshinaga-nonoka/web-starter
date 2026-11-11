// A small headless Chrome driver (DevTools protocol, no packages): the shared base of the check tools in this folder.
// Each tool starts its own Chrome with a throwaway profile and closes it at the end, so tools never share state.
// Chrome is found at CHROME, then the usual macOS and Linux places.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export const sleep = ms => new Promise(r => setTimeout(r, ms));

function chromePath() {
  const known = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ].filter(Boolean);
  for (const p of known) if (existsSync(p)) return p;
  for (const name of ['google-chrome', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [name], { encoding: 'utf8' }).trim(); } catch {}
  }
  throw new Error('Chrome が見つかりません。CHROME=/path/to/chrome を付けて実行してください');
}

/** `--key value` and `--flag` into an object; the rest are positional (`_`). */
export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

/** "1440x900,390x844" → [[1440, 900], [390, 844]] */
export const sizes = s => String(s).split(',').map(x => x.split('x').map(Number));

/**
 * Start Chrome and return a page.
 * options: width, height, scale (device pixels), reduced (prefers-reduced-motion), autoplay (videos play unmuted-gesture free),
 * log (collect console errors, CSP reports and failed requests into page.log / page.failed)
 */
export async function launch({ width = 1440, height = 900, scale = 1, reduced = false, autoplay = false, log = false } = {}) {
  const port = 9333 + Math.floor(Math.random() * 2000);
  const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
  const flags = ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${width},${height}`,
    '--hide-scrollbars', '--mute-audio', '--no-first-run', '--no-default-browser-check'];
  if (autoplay) flags.push('--autoplay-policy=no-user-gesture-required');
  const chrome = spawn(chromePath(), [...flags, 'about:blank'], { stdio: 'ignore' });

  let target;
  for (let i = 0; i < 75 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {}
    if (!target) await sleep(200);
  }
  if (!target) { chrome.kill(); throw new Error('Chrome が起動しませんでした'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0;
  const pending = new Map();
  const page = { log: [], failed: [] };
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (!log) return;
    if (m.method === 'Log.entryAdded') page.log.push(`${m.params.entry.level}: ${m.params.entry.text.slice(0, 240)}`);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      page.log.push('console.error: ' + JSON.stringify(m.params.args.map(a => a.value ?? a.description)).slice(0, 240));
    if (m.method === 'Runtime.exceptionThrown')
      page.log.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 240));
    if (m.method === 'Network.loadingFailed' && !m.params.canceled)
      page.failed.push(`${m.params.errorText} ${m.params.blockedReason || ''}`.trim());
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, m => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  /** Evaluate an expression (awaits promises) and return its value. */
  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result?.value;
  };
  const resize = (w, h, s = scale) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: s, mobile: w < 640 });

  await send('Page.enable');
  if (log) { await send('Log.enable'); await send('Runtime.enable'); await send('Network.enable'); }
  await resize(width, height);
  if (reduced) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

  Object.assign(page, {
    send, ev, resize,
    /** Open a URL and wait: `wait` ms after load, then for the fonts. */
    async goto(url, wait = 2500) {
      await send('Page.navigate', { url });
      await sleep(wait);
      await ev('document.fonts.ready.then(() => new Promise(r => setTimeout(r, 300)))').catch(() => {});
    },
    /** Save the viewport (png or jpg by the file's extension). */
    async shot(file) {
      mkdirSync(dirname(file), { recursive: true });
      const format = file.endsWith('.png') ? 'png' : 'jpeg';
      const r = await send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 88 : undefined });
      writeFileSync(file, Buffer.from(r.data, 'base64'));
      return file;
    },
    async click(x, y) {
      for (const type of ['mousePressed', 'mouseReleased'])
        await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    },
    close() {
      try { ws.close(); } catch {}
      chrome.kill();
      setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} }, 500);
    },
  });
  return page;
}
