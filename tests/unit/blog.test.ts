import { describe, expect, it } from 'vitest';
import {
  adjacentPosts,
  countTags,
  filterPublished,
  sharedReadingMinutes,
  partTitle,
  readingMinutes,
  seriesNeighbors,
  seriesParts,
  sortPosts,
  tagSlug,
  validateSeries,
} from '../../src/lib/blog';
import { formatDate } from '../../src/lib/format';

describe('tagSlug', () => {
  it('makes lowercase kebab-case slugs', () => {
    expect(tagSlug('Developer Tools')).toBe('developer-tools');
    expect(tagSlug('  C++ & Rust!  ')).toBe('c-rust');
    expect(tagSlug('Đường dẫn')).toBe('duong-dan');
    expect(tagSlug('neovim')).toBe('neovim');
  });
});

describe('readingMinutes', () => {
  const words = (n: number) => Array(n).fill('word').join(' ');
  it('is at least one minute', () => {
    expect(readingMinutes('')).toBe(1);
    expect(readingMinutes('short post')).toBe(1);
  });
  it('rounds words / 200', () => {
    expect(readingMinutes(words(2000))).toBe(10);
    expect(readingMinutes(words(2400))).toBe(12);
  });
  it('ignores imports and JSX tags', () => {
    expect(readingMinutes(`import X from './x.astro';\n<X type="note" />\n${words(400)}`)).toBe(2);
  });
});

describe('validateSeries', () => {
  const series = [{ id: 'guide', parts: [{ part: 1 }, { part: 2 }] }];
  const post = (id: string, s?: string, part?: number, lang = 'en') => ({
    id,
    lang,
    series: s,
    seriesPart: part,
  });
  it('accepts valid posts, other languages and posts outside a series', () => {
    expect(
      validateSeries(
        [
          post('en/a', 'guide', 1),
          post('vi/a', 'guide', 1, 'vi'),
          post('en/b', 'guide', 2),
          post('en/c'),
        ],
        series,
      ),
    ).toEqual([]);
  });
  it('reports an unknown series', () => {
    expect(validateSeries([post('en/a', 'nope', 1)], series)[0]).toMatch(/does not exist/);
  });
  it('requires seriesPart and rejects it without a series', () => {
    expect(validateSeries([post('en/a', 'guide')], series)[0]).toMatch(/required/);
    expect(validateSeries([post('en/a', undefined, 1)], series)[0]).toMatch(/without series/);
  });
  it('rejects a part the series does not list', () => {
    expect(validateSeries([post('en/a', 'guide', 9)], series)[0]).toMatch(/not listed/);
  });
  it('rejects a duplicate part within a series and language', () => {
    const errors = validateSeries([post('en/a', 'guide', 1), post('en/b', 'guide', 1)], series);
    expect(errors[0]).toMatch(/already used by en\/a/);
  });
});

describe('series parts', () => {
  const parts = [
    { part: 2, title: 'Two' },
    { part: 1, title: 'One' },
    { part: 3, title: 'Three' },
  ];
  it('lists every part in order with published posts attached', () => {
    const list = seriesParts(parts, [{ seriesPart: 1 }, { seriesPart: 3 }]);
    expect(list.map((p) => p.part)).toEqual([1, 2, 3]);
    expect(list.map((p) => !!p.post)).toEqual([true, false, true]);
  });
  it('hides prev/next when the adjacent part is unpublished', () => {
    const list = seriesParts(parts, [{ seriesPart: 1 }, { seriesPart: 3 }]);
    expect(seriesNeighbors(list, 1)).toEqual({ prev: undefined, next: undefined });
    expect(seriesNeighbors(list, 2).prev?.part).toBe(1);
    expect(seriesNeighbors(list, 2).next?.part).toBe(3);
  });
});

describe('post helpers', () => {
  const p = (slug: string, date: string, tags: string[] = []) => ({
    slug,
    data: { pubDate: new Date(date), tags },
  });
  const posts = sortPosts([
    p('b', '2026-02-01', ['x', 'y']),
    p('a', '2026-01-01', ['x']),
    p('c', '2026-03-01'),
  ]);
  it('sorts newest first', () => expect(posts.map((x) => x.slug)).toEqual(['c', 'b', 'a']));
  it('finds older (prev) and newer (next) posts', () => {
    expect(adjacentPosts(posts, 'b')).toEqual({ prev: posts[2], next: posts[0] });
    expect(adjacentPosts(posts, 'c').next).toBeUndefined();
    expect(adjacentPosts(posts, 'a').prev).toBeUndefined();
  });
  it('counts tags, most used first', () => {
    expect(countTags(posts)).toEqual([
      { tag: 'x', count: 2 },
      { tag: 'y', count: 1 },
    ]);
  });
  it('prefixes the part number only when the title lacks it', () => {
    expect(partTitle('From zero', 1)).toBe('Part 1: From zero');
    expect(partTitle('Guide, Part 1: from zero', 1)).toBe('Guide, Part 1: from zero');
    expect(partTitle('Từ số 0', 1, 'vi')).toBe('Phần 1: Từ số 0');
    expect(partTitle('Standalone', undefined)).toBe('Standalone');
  });
  it('formats dates per language in UTC', () => {
    expect(formatDate(new Date('2026-11-01'), 'en')).toBe('1 Nov 2026');
  });
});

describe('filterPublished', () => {
  const posts = [{ data: { draft: true } }, { data: { draft: false } }, { data: {} }];
  it('hides drafts in production builds', () => {
    expect(filterPublished(posts, false)).toHaveLength(2);
  });
  it('shows drafts in astro dev', () => {
    expect(filterPublished(posts, true)).toHaveLength(3);
  });
});

describe('sharedReadingMinutes', () => {
  const words = (n: number) => Array(n).fill('w').join(' ');
  it('uses the English body for translations so both languages match', () => {
    expect(sharedReadingMinutes({ en: words(2000), own: words(3000) })).toBe(10);
    expect(sharedReadingMinutes({ own: words(600) })).toBe(3);
  });
});
