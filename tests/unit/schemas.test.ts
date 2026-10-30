import { describe, expect, it } from 'vitest';
import { skillSchema } from '../../src/lib/schemas';

const base = {
  group: 'Cloud Platform',
  order: 2,
  description: 'Build AWS data lakes.',
  icon: 'cloud',
  size: '1x1',
  tint: 'sky',
  items: [{ name: 'AWS', children: ['S3'] }],
};

describe('skillSchema', () => {
  it('accepts a valid category', () => {
    expect(skillSchema.safeParse(base).success).toBe(true);
  });
  it('rejects a description over 200 characters', () => {
    expect(skillSchema.safeParse({ ...base, description: 'x'.repeat(200) }).success).toBe(true);
    expect(skillSchema.safeParse({ ...base, description: 'x'.repeat(201) }).success).toBe(false);
  });
  it('rejects an unknown size or tint', () => {
    expect(skillSchema.safeParse({ ...base, size: '3x3' }).success).toBe(false);
    expect(skillSchema.safeParse({ ...base, tint: 'red' }).success).toBe(false);
  });
});
