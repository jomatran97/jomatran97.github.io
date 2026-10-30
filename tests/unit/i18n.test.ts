import { describe, expect, it } from 'vitest';
import en from '../../src/i18n/en.json';
import vi from '../../src/i18n/vi.json';
import { t } from '../../src/i18n';
import {
  langFromPath,
  localePath,
  stripLang,
  switchLangPath,
  switchTarget,
} from '../../src/i18n/routes';
import { parseCodeMeta } from '../../src/lib/shiki-transformer';

describe('t()', () => {
  it('looks up per language and interpolates', () => {
    expect(t('en', 'nav.projects')).toBe('Projects');
    expect(t('vi', 'nav.projects')).toBe('Dự án');
    expect(t('en', 'common.at', { company: 'Datum' })).toBe('At Datum');
  });
  it('has the same keys in both languages', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });
});

describe('route helpers', () => {
  it('detects and strips the language prefix', () => {
    expect(langFromPath('/vi/experiences/')).toBe('vi');
    expect(langFromPath('/violet/')).toBe('en');
    expect(stripLang('/vi/experiences/')).toBe('/experiences/');
    expect(stripLang('/vi')).toBe('/');
  });
  it('builds localised paths', () => {
    expect(localePath('/experiences/', 'vi')).toBe('/vi/experiences/');
    expect(localePath('/vi/experiences/', 'en')).toBe('/experiences/');
    expect(localePath('/', 'vi')).toBe('/vi/');
    expect(localePath('/#skills', 'vi')).toBe('/vi/#skills');
    expect(switchLangPath('/projects/', 'vi')).toBe('/vi/projects/');
  });
});

describe('parseCodeMeta', () => {
  it('reads the title and line ranges', () => {
    const { title, highlight } = parseCodeMeta('title="lua/lazy.lua" {3-5,8}');
    expect(title).toBe('lua/lazy.lua');
    expect([...highlight]).toEqual([3, 4, 5, 8]);
  });
});

describe('switchTarget', () => {
  it('keeps the page when the other language has it', () => {
    expect(switchTarget(['en', 'vi'], 'en', '/star/x/', '/star/')).toBe('/vi/star/x/');
    expect(switchTarget(['en', 'vi'], 'vi', '/star/x/', '/star/')).toBe('/star/x/');
  });
  it('falls back to the section index when there is no translation', () => {
    expect(switchTarget(['en'], 'en', '/star/x/', '/star/')).toBe('/vi/star/');
    expect(switchTarget(['vi'], 'vi', '/blog/y/', '/blog/')).toBe('/blog/');
  });
});
