import { describe, expect, it } from 'vitest';
import {
  CV_DATE_RE,
  companyLabel,
  formatCvDate,
  formatDateRange,
  skillItemText,
  sortProjects,
  sortRoles,
} from '../../src/lib/cv';

describe('formatCvDate', () => {
  it('renders month precision per language', () => {
    expect(formatCvDate('2026-08', 'en')).toBe('Aug 2026');
    expect(formatCvDate('2026-03', 'vi')).toBe('03/2026');
  });
  it('renders year-only dates without a month', () => {
    expect(formatCvDate('2024', 'en')).toBe('2024');
    expect(formatCvDate('2024', 'vi')).toBe('2024');
  });
  it('renders an empty end as Present', () => {
    expect(formatCvDate(undefined, 'en')).toBe('Present');
    expect(formatCvDate('', 'vi')).toBe('Nay');
    expect(formatDateRange('2024', '2026-03', 'en')).toBe('2024 – Mar 2026');
    expect(formatDateRange('2026-08', undefined, 'en')).toBe('Aug 2026 – Present');
  });
  it('validates YYYY and YYYY-MM only', () => {
    for (const ok of ['2024', '2024-01', '2024-12']) expect(CV_DATE_RE.test(ok)).toBe(true);
    for (const bad of ['24', '2024-13', '2024-1', '2024-00', 'Aug 2026', '']) {
      expect(CV_DATE_RE.test(bad)).toBe(false);
    }
  });
});

describe('sortRoles', () => {
  const role = (id: string, start: string, end?: string) => ({ id, start, end });
  it('puts the current role first and sorts by start descending', () => {
    const sorted = sortRoles([
      role('old', '2019', '2020'),
      role('mid', '2024', '2026-03'),
      role('now', '2026-08'),
      role('tymex', '2021', '2024'),
    ]);
    expect(sorted.map((r) => r.id)).toEqual(['now', 'mid', 'tymex', 'old']);
  });
  it('keeps an ongoing role first even if it started earlier', () => {
    expect(sortRoles([role('done', '2025', '2026'), role('open', '2020')])[0].id).toBe('open');
  });
  it('treats a year-only start as January', () => {
    const sorted = sortRoles([role('a', '2024', '2025'), role('b', '2024-02', '2025')]);
    expect(sorted.map((r) => r.id)).toEqual(['b', 'a']);
  });
  it('keeps the same company twice as separate entries', () => {
    const sorted = sortRoles([role('fpt-2020', '2020', '2021'), role('fpt-2026', '2026-08')]);
    expect(sorted).toHaveLength(2);
    expect(sorted[0].id).toBe('fpt-2026');
  });
});

describe('sortProjects', () => {
  it('sorts featured first, then newest, then ongoing before finished', () => {
    const p = (id: string, start: string, end?: string, featured = false) => ({
      id,
      start,
      end,
      featured,
    });
    const sorted = sortProjects([
      p('old', '2020', '2021'),
      p('done', '2025', '2025'),
      p('open', '2025'),
      p('feat', '2019', '2020', true),
    ]);
    expect(sorted.map((x) => x.id)).toEqual(['feat', 'open', 'done', 'old']);
  });
});

describe('labels', () => {
  it('joins company and client', () => {
    expect(companyLabel('Datum', 'Security Bank')).toBe('Datum / Security Bank');
    expect(companyLabel('FPT Software')).toBe('FPT Software');
    expect(companyLabel('FPT Software', '')).toBe('FPT Software');
  });
  it('formats skill items with children', () => {
    expect(skillItemText({ name: 'AWS', children: ['EMR', 'S3'] })).toBe('AWS (EMR, S3)');
    expect(skillItemText({ name: 'Git' })).toBe('Git');
  });
});
