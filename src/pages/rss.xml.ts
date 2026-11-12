import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../site.config';
import { getPosts, postUrl, plainText } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.slice(0, 30).map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: plainText(p.body).slice(0, 200),
      link: postUrl(p.id),
    })),
  });
}
