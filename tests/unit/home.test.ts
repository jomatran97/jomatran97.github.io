import { describe, expect, it } from 'vitest';
import { storyLayout, workEmptyStates } from '../../src/lib/home';

describe('storyLayout', () => {
  it('uses 3 columns for 3 stories, 2 for 2, and one wide card for 1', () => {
    expect(storyLayout(3)).toEqual({ columns: 3, wide: false, className: 'n-3' });
    expect(storyLayout(2)).toEqual({ columns: 2, wide: false, className: 'n-2' });
    expect(storyLayout(1)).toEqual({ columns: 1, wide: true, className: 'n-1' });
  });
  it('never exceeds 3 columns', () => {
    expect(storyLayout(5).columns).toBe(3);
  });
});

describe('workEmptyStates', () => {
  it('returns an empty-state key only for the empty columns', () => {
    expect(workEmptyStates({ hasProject: true, postCount: 1, certCount: 2 })).toEqual({
      project: undefined,
      posts: undefined,
      certs: undefined,
    });
    expect(workEmptyStates({ hasProject: false, postCount: 0, certCount: 0 })).toEqual({
      project: 'home.work.projectEmpty',
      posts: 'home.work.postsEmpty',
      certs: 'home.work.certsEmpty',
    });
    expect(workEmptyStates({ hasProject: true, postCount: 0, certCount: 3 }).posts).toBe(
      'home.work.postsEmpty',
    );
  });
});
