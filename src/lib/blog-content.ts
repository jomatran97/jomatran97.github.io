import { getCollection } from 'astro:content';
import { getLocalized, type Localized } from './content';
import {
  filterPublished,
  seriesParts,
  sharedReadingMinutes,
  sortPosts,
  validateSeries,
} from './blog';
import type { Lang } from '../i18n';

export type Post = Localized<'blog'> & { minutes: number };
const slugOf = (id: string) => id.split('/').slice(1).join('/');

let checked: Promise<void> | undefined;
/** Fails the build when a post's `series`/`seriesPart` contradicts the series collection. */
function checkSeries(): Promise<void> {
  checked ??= (async () => {
    const [posts, series] = await Promise.all([getCollection('blog'), getCollection('series')]);
    const errors = validateSeries(
      posts.map((p) => ({ id: p.id, lang: p.id.split('/')[0], ...pick(p.data) })),
      series.map((s) => ({ id: slugOf(s.id), parts: s.data.parts })),
    );
    if (errors.length) throw new Error(`Invalid series metadata:\n- ${errors.join('\n- ')}`);
  })();
  return checked;
}
const pick = (d: { series?: string; seriesPart?: number }) => ({
  series: d.series,
  seriesPart: d.seriesPart,
});

/** Published posts for `lang` (drafts only in `astro dev`), newest first. */
export async function getPosts(lang: Lang) {
  await checkSeries();
  const { items, fallback } = await getLocalized('blog', lang);
  const english = new Map(
    (await getCollection('blog'))
      .filter((p) => p.id.startsWith('en/'))
      .map((p) => [slugOf(p.id), p.body]),
  );
  const posts: Post[] = sortPosts(filterPublished(items, import.meta.env.DEV)).map((p) => ({
    ...p,
    minutes: sharedReadingMinutes({ en: english.get(p.slug), own: p.body }),
  }));
  return { posts, fallback: fallback && posts.some((p) => p.contentLang !== lang) };
}

export async function getSeriesList(lang: Lang) {
  await checkSeries();
  const { items, fallback } = await getLocalized('series', lang);
  return { series: items, fallback };
}

/** A series with all of its planned parts and the published post for each. */
export async function getSeriesDetail(slug: string, lang: Lang) {
  const { series } = await getSeriesList(lang);
  const entry = series.find((s) => s.slug === slug);
  if (!entry) return undefined;
  const { posts } = await getPosts(lang);
  const inSeries = posts.filter((p) => p.data.series === slug);
  const parts = seriesParts(
    entry.data.parts,
    inSeries.map((p) => ({ ...p, seriesPart: p.data.seriesPart })),
  );
  return { entry, parts, published: parts.filter((p) => p.post).length };
}
