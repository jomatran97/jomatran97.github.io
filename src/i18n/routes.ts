import type { Lang } from './index';

/** `getStaticPaths` result that yields every route twice: English (no prefix) and `/vi/`. */
export const langStaticPaths = () => [{ params: { lang: undefined } }, { params: { lang: 'vi' } }];

export const getLang = (param: string | undefined): Lang => (param === 'vi' ? 'vi' : 'en');

export const langFromPath = (path: string): Lang => (/^\/vi(\/|$)/.test(path) ? 'vi' : 'en');

/** `/vi/experiences/` → `/experiences/`. */
export function stripLang(path: string): string {
  const out = path.replace(/^\/vi(?=\/|$)/, '');
  return out === '' ? '/' : out;
}

/** `/experiences/#x` → `/vi/experiences/#x` for `vi`, unchanged for `en`. */
export function localePath(path: string, lang: Lang): string {
  const base = stripLang(path);
  return lang === 'vi' ? `/vi${base}` : base;
}

export const switchLangPath = (path: string, target: Lang): string => localePath(path, target);

/**
 * Language switch target: the same page when the other language has real content for it,
 * otherwise that language's section index.
 */
export function switchTarget(
  available: Lang[],
  current: Lang,
  path: string,
  sectionIndex: string,
): string {
  const other: Lang = current === 'vi' ? 'en' : 'vi';
  return localePath(available.includes(other) ? path : sectionIndex, other);
}
