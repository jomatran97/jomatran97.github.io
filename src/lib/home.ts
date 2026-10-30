export interface StoryLayout {
  /** Grid columns on desktop (>= 1024px). */
  columns: number;
  /** One story gets a wide card with its question and Situation summary. */
  wide: boolean;
  className: string;
}

/** Count-adaptive STAR layout (spec §4.1.5): 3 stories = 3 columns, 2 = 2, 1 = one wide card. */
export const storyLayout = (count: number): StoryLayout => ({
  columns: Math.min(Math.max(count, 1), 3),
  wide: count === 1,
  className: `n-${Math.min(Math.max(count, 1), 3)}`,
});

export type WorkEmptyKey =
  'home.work.projectEmpty' | 'home.work.postsEmpty' | 'home.work.certsEmpty';

/** Which Work & writing columns show their empty-state line instead of an empty card. */
export function workEmptyStates(input: {
  hasProject: boolean;
  postCount: number;
  certCount: number;
}): { project?: WorkEmptyKey; posts?: WorkEmptyKey; certs?: WorkEmptyKey } {
  return {
    project: input.hasProject ? undefined : 'home.work.projectEmpty',
    posts: input.postCount > 0 ? undefined : 'home.work.postsEmpty',
    certs: input.certCount > 0 ? undefined : 'home.work.certsEmpty',
  };
}

export type HomeSection = 'skills' | 'work' | 'stories' | 'contact';

/** Canvas sections in order. With no featured stories the section (and its index link) is left out. */
export const homeSections = (storyCount: number): HomeSection[] => [
  'skills',
  'work',
  ...(storyCount > 0 ? (['stories'] as const) : []),
  'contact',
];
