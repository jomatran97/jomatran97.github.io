// JS budget (spec §9): at most 30 KB gzip of JavaScript on any page before search is opened.
import { readFile, readdir } from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const BUDGET = 30 * 1024;

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'pagefind') out.push(...(await htmlFiles(p)));
    } else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const cache = new Map<string, number>();
async function assetSize(url: string): Promise<number> {
  if (!cache.has(url)) cache.set(url, gzipSync(await readFile(join(DIST, url))).length);
  return cache.get(url)!;
}

let worst = { page: '', bytes: 0 };
let over = 0;
const pages = await htmlFiles(DIST);
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  let bytes = 0;
  const external = new Set<string>();
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi)) {
    if (/application\/ld\+json/.test(m[1])) continue;
    const src = /\bsrc="([^"]+)"/.exec(m[1])?.[1];
    if (!src) bytes += gzipSync(m[2]).length;
    else if (src.startsWith('/')) external.add(src);
  }
  for (const m of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g))
    external.add(m[1]);
  for (const url of external) bytes += await assetSize(url);
  if (bytes > worst.bytes) worst = { page: file, bytes };
  if (bytes > BUDGET) {
    over++;
    console.error(`FAIL ${file}: ${(bytes / 1024).toFixed(1)} KB gzip`);
  }
}
const line = `JS budget: ${pages.length} pages, largest ${(worst.bytes / 1024).toFixed(1)} KB gzip (${worst.page}), limit 30 KB`;
console.log(line);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- ${line}\n`);
process.exit(over ? 1 : 0);
