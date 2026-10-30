import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import FeaturedStories from '../../src/components/home/FeaturedStories.astro';
import WorkWriting from '../../src/components/home/WorkWriting.astro';
import { homeSections } from '../../src/lib/home';
import { t } from '../../src/i18n';

const story = (n: number) =>
  ({
    slug: `story-${n}`,
    data: {
      title: `Story ${n}`,
      question: `Question ${n}?`,
      competencies: [],
      metrics: [],
      sample: false,
    },
    rendered: {
      html: ['Situation', 'Task', 'Action', 'Result']
        .map((h) => `<h2>${h}</h2><p>${h} text ${n}</p>`)
        .join(''),
    },
  }) as never;

async function stories(count: number) {
  const container = await AstroContainer.create();
  return container.renderToString(FeaturedStories, {
    props: { lang: 'en', stories: Array.from({ length: count }, (_, i) => story(i + 1)) },
  });
}

describe('FeaturedStories', () => {
  for (const [count, cls] of [
    [3, 'n-3'],
    [2, 'n-2'],
  ] as const) {
    it(`renders ${count} compact cards with the ${cls} layout class`, async () => {
      const html = await stories(count);
      expect(html).toContain(`stories ${cls}`);
      expect(html.match(/<li class="card/g)).toHaveLength(count);
      expect(html).not.toContain('Question 1?');
      expect(html).not.toContain(t('en', 'home.stories.situation'));
    });
  }

  it('renders one wide card with the question and the Situation summary', async () => {
    const html = await stories(1);
    expect(html).toContain('stories n-1');
    expect(html.match(/<li class="card/g)).toHaveLength(1);
    expect(html).toContain('Question 1?');
    expect(html).toContain(t('en', 'home.stories.situation'));
    expect(html).toContain('Situation text 1');
    expect(html).not.toContain('Task text 1');
  });
});

describe('homeSections', () => {
  it('omits the stories section and its index link when there are no stories', () => {
    expect(homeSections(0)).toEqual(['skills', 'work', 'contact']);
    expect(homeSections(1)).toEqual(['skills', 'work', 'stories', 'contact']);
  });
});

describe('WorkWriting', () => {
  it('shows the empty-state line for each empty list instead of an empty card body', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WorkWriting, {
      props: { lang: 'en', posts: [], certs: [], seriesTitle: () => undefined },
    });
    expect(html).toContain(t('en', 'home.work.projectEmpty'));
    expect(html).toContain(t('en', 'home.work.postsEmpty'));
    expect(html).toContain(t('en', 'home.work.certsEmpty'));
    expect(html).not.toContain('<ul class="mt-4');
    expect(html).not.toContain(t('en', 'home.posts.all'));
  });
});
