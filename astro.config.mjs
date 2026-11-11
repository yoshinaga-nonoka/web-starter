// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// The public URL (canonical, OGP, sitemap): SITE_URL in .env or the Cloudflare build variables, else SITE.url in
// src/lib/site.ts. Read here as text so the config needs no TypeScript.
import { readFileSync } from 'node:fs';
const { SITE_URL } = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const fromSiteTs = readFileSync(new URL('./src/lib/site.ts', import.meta.url), 'utf8').match(/url:\s*'([^']+)'/)?.[1];

export default defineConfig({
  site: SITE_URL || fromSiteTs || 'https://example.com',
  trailingSlash: 'ignore',
});
