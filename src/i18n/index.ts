import en from './en.json';
import vi from './vi.json';

export const locales = ['en', 'vi'] as const;
export type Lang = (typeof locales)[number];
export type TKey = keyof typeof en;

// `Record<TKey, string>` makes `astro check` fail when vi.json is missing a key.
const dictionaries: Record<Lang, Record<TKey, string>> = { en, vi };

/** Typed translation lookup; `{name}` placeholders are filled from `vars`. */
export function t(lang: Lang, key: TKey, vars: Record<string, string | number> = {}): string {
  return dictionaries[lang][key].replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  );
}

/** Binds a language: `const t = useT(lang); t('nav.cv')`. */
export const useT =
  (lang: Lang) =>
  (key: TKey, vars?: Record<string, string | number>): string =>
    t(lang, key, vars);

export const htmlLang = (lang: Lang) => (lang === 'vi' ? 'vi' : 'en');
export const intlLocale = (lang: Lang) => (lang === 'vi' ? 'vi-VN' : 'en-GB');
