import { readdir, readFile } from 'node:fs/promises';
import { parse } from 'yaml';

/** Parses the YAML frontmatter of a Markdown file. */
export function frontmatter(md: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md);
  return (match ? parse(match[1]) : {}) as Record<string, unknown>;
}

export async function readEntry(path: string) {
  return frontmatter(await readFile(path, 'utf8'));
}

/** Frontmatter of every Markdown file in `src/content/<collection>/<lang>/` (English fallback). */
export async function readCollection(collection: string, lang = 'en') {
  const localized = `src/content/${collection}/${lang}`;
  const dir = (await readdir(localized).catch(() => [])).some((f) => f.endsWith('.md'))
    ? localized
    : `src/content/${collection}/en`;
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  return Promise.all(files.map((f) => readEntry(`${dir}/${f}`)));
}
