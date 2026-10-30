/** Lowercase kebab-case slug: "Developer Tools!" → "developer-tools". */
export const tagSlug = (tag: string): string =>
  tag
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Reading time in whole minutes (at least 1) from a Markdown/MDX body. */
export function readingMinutes(body: string, wordsPerMinute = 200): number {
  const text = body
    .replace(/^(import|export) .*$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_#>|\-]+/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

export interface PostRef {
  id: string;
  lang: string;
  series?: string;
  seriesPart?: number;
}
export interface SeriesRef {
  id: string;
  parts: { part: number }[];
}

/**
 * Cross-checks posts against the series collection (spec §6.7). Returns one message per problem:
 * unknown series, missing `seriesPart`, a part the series does not list, or a part used twice
 * within the same series and language.
 */
export function validateSeries(posts: PostRef[], series: SeriesRef[]): string[] {
  const errors: string[] = [];
  const byId = new Map(series.map((s) => [s.id, s]));
  const seen = new Map<string, string>();
  for (const p of posts) {
    if (!p.series) {
      if (p.seriesPart !== undefined) errors.push(`${p.id}: seriesPart is set without series`);
      continue;
    }
    const s = byId.get(p.series);
    if (!s) {
      errors.push(`${p.id}: series "${p.series}" does not exist`);
      continue;
    }
    if (p.seriesPart === undefined) {
      errors.push(`${p.id}: seriesPart is required when series is set`);
      continue;
    }
    if (!s.parts.some((x) => x.part === p.seriesPart))
      errors.push(`${p.id}: part ${p.seriesPart} is not listed in series "${p.series}"`);
    const key = `${p.lang}/${p.series}/${p.seriesPart}`;
    const other = seen.get(key);
    if (other)
      errors.push(`${p.id}: part ${p.seriesPart} of "${p.series}" is already used by ${other}`);
    else seen.set(key, p.id);
  }
  return errors;
}

/** Every planned part of a series, with the published post (if any) attached. */
export function seriesParts<T extends { part: number }, P extends { seriesPart?: number }>(
  parts: T[],
  publishedPosts: P[],
): (T & { post?: P })[] {
  return [...parts]
    .sort((a, b) => a.part - b.part)
    .map((p) => ({ ...p, post: publishedPosts.find((x) => x.seriesPart === p.part) }));
}

/** Previous/next *part* of a series; a side is undefined when that part is not published. */
export function seriesNeighbors<T extends { part: number; post?: unknown }>(
  parts: T[],
  current: number,
) {
  const adjacent = (n: number) => parts.find((p) => p.part === n && p.post);
  return { prev: adjacent(current - 1), next: adjacent(current + 1) };
}

/** Newest first. */
export const sortPosts = <T extends { data: { pubDate: Date } }>(posts: T[]): T[] =>
  [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

/** Older post (`prev`) and newer post (`next`) around `slug` in a newest-first list. */
export function adjacentPosts<T extends { slug: string }>(sorted: T[], slug: string) {
  const i = sorted.findIndex((p) => p.slug === slug);
  return { prev: i >= 0 ? sorted[i + 1] : undefined, next: i > 0 ? sorted[i - 1] : undefined };
}

/** Tags with post counts, most used first, then alphabetical. */
export function countTags(posts: { data: { tags: string[] } }[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts)
    for (const t of new Set(p.data.tags)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** "Part 1: Title" unless the title already starts with the part label (RSS titles). */
export function partTitle(
  title: string,
  part: number | undefined,
  lang: 'en' | 'vi' = 'en',
): string {
  if (part === undefined || /\b(part|phần)\s*\d+/i.test(title)) return title;
  return `${lang === 'vi' ? 'Phần' : 'Part'} ${part}: ${title}`;
}

/** Drafts are hidden unless `includeDrafts` (true in `astro dev`). */
export const filterPublished = <T extends { data: { draft?: boolean } }>(
  posts: T[],
  includeDrafts: boolean,
): T[] => posts.filter((p) => includeDrafts || !p.data.draft);

/**
 * Reading time shared by all translations of a post: the English body when there is one,
 * otherwise the post's own body, so EN and VI show the same number.
 */
export const sharedReadingMinutes = (bodies: { en?: string; own?: string }): number =>
  readingMinutes(bodies.en ?? bodies.own ?? '');
