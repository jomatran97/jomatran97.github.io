import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { partTitle } from '~/lib/blog';
import { getPosts } from '~/lib/blog-content';
import { getLang, langStaticPaths, localePath } from '~/i18n/routes';
import { htmlLang, t } from '~/i18n';

export const getStaticPaths = (() => langStaticPaths()) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const lang = getLang(context.params.lang);
  const { posts } = await getPosts(lang);
  return rss({
    title: `${t(lang, 'meta.siteName')} · ${t(lang, 'blog.title')}`,
    description: t(lang, 'blog.description'),
    site: context.site!,
    customData: `<language>${htmlLang(lang)}</language>`,
    items: posts.map((p) => ({
      title: partTitle(p.data.title, p.data.seriesPart, lang),
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: localePath(`/blog/${p.slug}/`, lang),
      categories: p.data.tags,
    })),
  });
}
