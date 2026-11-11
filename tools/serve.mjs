// A plain static server for checking: the built site, or the repository root for the design boards.
// usage: node tools/serve.mjs [dir=dist] [port=5481]
//   npm run serve          → dist on http://127.0.0.1:5481/ (after npm run build / build:fixture)
//   npm run serve:design   → the repository on http://127.0.0.1:5482/ (design/hero/board.html, design/loading/board.html)
// Folders answer with their index.html, unknown paths with dist's 404.html. Headers in public/_headers are NOT applied
// here; use `npm run preview:headers` (wrangler) for those.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] || 'dist');
const port = +(process.argv[3] || 5481);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2',
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  let status = 200;
  if (!existsSync(file)) {
    file = join(root, '404.html');
    status = 404;
    if (!existsSync(file)) { res.writeHead(404).end('not found'); return; }
  }
  const size = statSync(file).size;
  const type = types[extname(file).toLowerCase()] || 'application/octet-stream';
  // ranges, so videos play and seek as they do on Cloudflare
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range && status === 200) {
    const start = range[1] ? +range[1] : 0;
    const end = range[2] ? +range[2] : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/  (${root})`));
