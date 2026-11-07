import type { CollectionEntry } from 'astro:content';

export function postSlug(entry: CollectionEntry<'posts'>) {
  return entry.id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function postUrl(entry: CollectionEntry<'posts'>) {
  return `/posts/${postSlug(entry)}/`;
}

export function formatPostDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles',
  });
}
