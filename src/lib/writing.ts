import type { CollectionEntry } from 'astro:content';

export function writingSlug(entry: CollectionEntry<'writing'>) {
  return entry.id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function writingUrl(entry: CollectionEntry<'writing'>) {
  return `/writing/${writingSlug(entry)}/`;
}
