import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { postUrl } from '../lib/posts';

export async function GET(context) {
  const posts = (await getCollection('posts')).toSorted((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: 'Adrianne Daley',
    description: 'Posts and talks by Adrianne Daley.',
    site: context.site,
    items: posts.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      link: postUrl(entry),
      categories: [entry.data.categories],
    })),
  });
}
