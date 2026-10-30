import { intlLocale, type Lang } from '../i18n';

/** Long-form date such as "1 Nov 2026" (EN) or "01/11/2026" (VI), always in UTC. */
export const formatDate = (date: Date, lang: Lang): string =>
  new Intl.DateTimeFormat(intlLocale(lang), { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
