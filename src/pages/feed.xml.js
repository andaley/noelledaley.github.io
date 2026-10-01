import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { writingUrl } from '../lib/writing';

export async function GET(context) {
  const writing = (await getCollection('writing')).toSorted((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: 'Adrianne Daley',
    description: 'Writing and talks by Adrianne Daley.',
    site: context.site,
    items: writing.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      link: writingUrl(entry),
      categories: [entry.data.categories],
    })),
  });
}
