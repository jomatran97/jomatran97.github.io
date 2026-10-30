import { t, type Lang } from '../i18n';

/** `YYYY` or `YYYY-MM`. */
export const CV_DATE_RE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** `2026-08` → "Aug 2026" (EN) / "08/2026" (VI); `2024` → "2024"; empty → "Present". */
export function formatCvDate(value: string | null | undefined, lang: Lang): string {
  if (!value) return t(lang, 'common.present');
  const [year, month] = value.split('-');
  if (!month) return year;
  return lang === 'vi' ? `${month}/${year}` : `${MONTHS_EN[Number(month) - 1]} ${year}`;
}

export const formatDateRange = (start: string, end: string | null | undefined, lang: Lang) =>
  `${formatCvDate(start, lang)} – ${formatCvDate(end, lang)}`;

/** Months since year 0; a year-only date counts as January. */
export function dateKey(value: string | null | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const [year, month] = value.split('-');
  return Number(year) * 12 + (month ? Number(month) - 1 : 0);
}

interface Dated {
  start: string;
  end?: string | null;
}

const ongoingFirst = (a: Dated, b: Dated) => Number(!b.end) - Number(!a.end);

/** Newest first. An ongoing role (empty `end`) always comes first, then by `start` descending. */
export function sortRoles<T extends Dated>(roles: T[]): T[] {
  return [...roles].sort(
    (a, b) =>
      ongoingFirst(a, b) || dateKey(b.start) - dateKey(a.start) || dateKey(b.end) - dateKey(a.end),
  );
}

/** Featured first, then `start` descending, then ongoing before finished. */
export function sortProjects<T extends Dated & { featured?: boolean }>(projects: T[]): T[] {
  return [...projects].sort(
    (a, b) =>
      Number(!!b.featured) - Number(!!a.featured) ||
      dateKey(b.start) - dateKey(a.start) ||
      ongoingFirst(a, b),
  );
}

/** "Datum / Security Bank" when a client is set, otherwise the company alone. */
export const companyLabel = (company: string, client?: string | null) =>
  client ? `${company} / ${client}` : company;

/** Plain-text display of a skill item: `AWS (EMR, S3)`. */
export const skillItemText = (item: { name: string; children?: string[] }) =>
  item.children?.length ? `${item.name} (${item.children.join(', ')})` : item.name;

/** `https://www.linkedin.com/in/x` → `linkedin.com/in/x`. */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
