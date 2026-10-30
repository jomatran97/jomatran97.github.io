import { getCollection, render, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Lang } from '../i18n';

export type Localized<K extends CollectionKey> = CollectionEntry<K> & {
  /** Entry slug shared by translations (the filename without extension). */
  slug: string;
  /** Language the content is actually written in (English when a translation is missing). */
  contentLang: Lang;
  /** Languages in which this entry really exists. */
  available: Lang[];
};

const slugOf = (id: string) => id.split('/').slice(1).join('/');

/**
 * Entries of a collection for `lang`. Entries with no translation fall back to the English file,
 * and `fallback` is true when any did, so the page can show the "English only" banner.
 */
export async function getLocalized<K extends CollectionKey>(
  name: K,
  lang: Lang,
): Promise<{ items: Localized<K>[]; fallback: boolean }> {
  const all = (await getCollection(name)) as CollectionEntry<K>[];
  const available = new Map<string, Lang[]>();
  for (const entry of all) {
    const slug = slugOf(entry.id);
    available.set(slug, [...(available.get(slug) ?? []), entry.id.split('/')[0] as Lang]);
  }
  const items = new Map<string, Localized<K>>();
  for (const entry of all) {
    const entryLang = entry.id.split('/')[0] as Lang;
    const slug = slugOf(entry.id);
    const base = { ...entry, slug, available: available.get(slug)! };
    if (entryLang === 'en' && !items.has(slug)) items.set(slug, { ...base, contentLang: 'en' });
    if (entryLang === lang) items.set(slug, { ...base, contentLang: lang });
  }
  const list = [...items.values()];
  return { items: list, fallback: lang !== 'en' && list.some((i) => i.contentLang !== lang) };
}

export async function getProfile(lang: Lang) {
  const { items, fallback } = await getLocalized('profile', lang);
  const entry = items[0];
  if (!entry) throw new Error('Missing profile: add src/content/profile/en/index.md');
  return { entry, data: entry.data, fallback };
}

export { render };
