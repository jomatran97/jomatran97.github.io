import { describe, expect, it } from 'vitest';
import { estimateHeight, flattenBands, layoutSkills, type SkillLike } from '../../src/lib/balance';

const card = (id: string, chips: number, len: number, wide = false) => ({
  id,
  chips,
  descriptionLength: len,
  wide,
});

describe('estimateHeight', () => {
  it('follows 120 + 22 x chip rows + 20 x description lines', () => {
    expect(estimateHeight(card('a', 4, 60))).toBe(120 + 22 + 20);
    expect(estimateHeight(card('a', 5, 61))).toBe(120 + 44 + 40);
    expect(estimateHeight(card('a', 0, 0))).toBe(120);
  });
});

describe('layoutSkills', () => {
  const cards = [
    card('data', 14, 150, true),
    card('cloud', 8, 110),
    card('devops', 12, 140, true),
    card('backend', 6, 95),
    card('ai', 6, 140, true),
    card('methods', 3, 110),
  ];

  it('preserves the input order in the DOM', () => {
    expect(flattenBands(layoutSkills(cards)).map((c) => c.id)).toEqual(cards.map((c) => c.id));
  });
  it('is deterministic', () => {
    expect(layoutSkills(cards)).toEqual(layoutSkills(cards));
  });
  it('starts a band with every wide card and puts the following narrow cards beside it', () => {
    const bands = layoutSkills(cards);
    expect(bands.map((b) => b.kind)).toEqual(['wide', 'wide', 'wide']);
    expect(bands[0]).toMatchObject({ wide: { id: 'data' }, side: [{ id: 'cloud' }] });
    expect(bands.map((b) => b.kind === 'wide' && b.flip)).toEqual([false, true, false]);
  });
  it('puts leading and trailing narrow cards into flow bands', () => {
    const bands = layoutSkills([
      card('a', 3, 50),
      card('b', 3, 50),
      card('w', 3, 50, true),
      card('c', 3, 50),
    ]);
    expect(bands.map((b) => b.kind)).toEqual(['flow', 'wide']);
    expect(bands[0]).toMatchObject({ items: [{ id: 'a' }, { id: 'b' }] });
  });
  it('stops filling the side stack once it is as tall as the wide card', () => {
    const tall = card('w', 4, 60, true); // 142
    const narrow = ['a', 'b', 'c'].map((id) => card(id, 4, 60)); // 142 each
    const [band, rest] = layoutSkills([tall, ...narrow]);
    expect(band).toMatchObject({ kind: 'wide', side: [{ id: 'a' }] });
    expect(rest).toMatchObject({ kind: 'flow', items: [{ id: 'b' }, { id: 'c' }] });
  });
  it('handles empty input and only narrow cards', () => {
    expect(layoutSkills<SkillLike>([])).toEqual([]);
    expect(layoutSkills([card('a', 1, 1)])).toEqual([{ kind: 'flow', items: [card('a', 1, 1)] }]);
  });
});
