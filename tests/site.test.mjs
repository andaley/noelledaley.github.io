import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import test from 'node:test';
import sharp from 'sharp';

const origin = 'https://adriannedaley.com';
const pages = globSync('dist/**/*.html');
const posts = globSync('src/content/posts/*.{md,mdx}');

test('every post has a static page, index entry, and feed entry', () => {
  assert.ok(posts.length > 0);
  assert.ok(existsSync('dist/posts/index.html'), 'Blog index must exist');
  const index = readFileSync('dist/posts/index.html', 'utf8');
  assert.match(index, /<title>Blog \| Adrianne Daley<\/title>/);
  const home = readFileSync('dist/index.html', 'utf8');
  assert.match(home, /href="\/posts\/">Blog<\/a>/);
  assert.match(home, /href="\/about\/">About<\/a>/);
  assert.doesNotMatch(home, /Selected work and talks|href="\/#work"/);
  const feed = readFileSync('dist/feed.xml', 'utf8');
  assert.equal((feed.match(/<item>/g) ?? []).length, posts.length);
  for (const post of posts) {
    const slug = post.split(sep).at(-1).replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx?$/, '');
    const url = `/posts/${slug}/`;
    assert.ok(existsSync(`dist${url}index.html`), post);
    assert.ok(index.includes(`href="${url}"`), post);
    assert.ok(feed.includes(`<link>${origin}${url}</link>`), post);
  }
});

test('pages contain static content, canonical metadata, and a focusable skip target', () => {
  assert.ok(pages.length >= posts.length + 4);
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /<html lang="en">/, file);
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, file);
    assert.match(html, /<main id="content" tabindex="-1">/, file);
    assert.match(html, /<link rel="canonical" href="https:\/\/adriannedaley\.com\//, file);
    assert.doesNotMatch(html, /Sample article for this design prototype|Sample summary\./, file);
    for (const iframe of html.matchAll(/<iframe\b[^>]*>/g)) {
      assert.match(iframe[0], /title="[^"]+"/, `${file}: unnamed iframe`);
    }
  }
});

test('local navigation and referenced assets resolve in the built site', () => {
  for (const file of pages) {
    const pageUrl = new URL('/' + relative('dist', file).split(sep).join('/').replace(/index\.html$/, ''), origin);
    const html = readFileSync(file, 'utf8');
    for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(value.replaceAll('&amp;', '&'), pageUrl);
      if (url.origin !== origin) continue;
      let target = join('dist', decodeURIComponent(url.pathname));
      assert.ok(existsSync(target), `${file}: missing ${value}`);
      if (statSync(target).isDirectory()) target = join(target, 'index.html');
      assert.ok(existsSync(target), `${file}: missing index for ${value}`);
      if (url.hash && target.endsWith('.html')) {
        const destination = readFileSync(target, 'utf8');
        assert.ok(destination.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: missing anchor ${value}`);
      }
    }
  }
});

test('static hosting files and licensed font are included', () => {
  assert.equal(readFileSync('dist/CNAME', 'utf8').trim(), 'adriannedaley.com');
  assert.ok(existsSync('dist/sitemap-index.xml'));
  assert.ok(existsSync('dist/fonts/source-serif-4-latin.woff2'));
  assert.match(readFileSync('dist/fonts/font-license.txt', 'utf8'), /SIL OPEN FONT LICENSE/);
});

test('article images reserve their intrinsic dimensions', async () => {
  for (const file of pages) {
    const pageUrl = new URL('/' + relative('dist', file).split(sep).join('/'), origin);
    const html = readFileSync(file, 'utf8');
    for (const [image] of html.matchAll(/<img\b[^>]*>/g)) {
      const src = image.match(/\bsrc="([^"]+)"/)[1];
      const { width, height } = await sharp(join('dist', new URL(src, pageUrl).pathname)).metadata();
      assert.equal(Number(image.match(/\bwidth="(\d+)"/)?.[1]), width, `${file}: ${src} width`);
      assert.equal(Number(image.match(/\bheight="(\d+)"/)?.[1]), height, `${file}: ${src} height`);
    }
  }
});

test('slide decks have descriptive names and permanent links', () => {
  for (const [slug, deck] of [
    ['sustainable-career-development', 'sustainable-career-development-advancing-while-still-having-free-time'],
    ['colocated-teams-devops-day-zurich', 'what-colocated-teams-can-learn-from-remote-teams'],
  ]) {
    const html = readFileSync(`dist/posts/${slug}/index.html`, 'utf8');
    assert.match(html, /(?:data-name|title)="[^"]+ slides"/, `${slug}: descriptive frame name`);
    assert.ok(html.includes(`href="https://speakerdeck.com/noelledaley/${deck}"`), `${slug}: direct slides link`);
  }
});

test('publication dates use Pacific time without changing timestamps', () => {
  const index = readFileSync('dist/posts/index.html', 'utf8');
  for (const [slug, timestamp, date] of [
    ['remote-work', '2018-06-09T00:28:11.000Z', 'June 8, 2018'],
    ['sustainable-career-development', '2016-06-23T00:28:11.000Z', 'June 22, 2016'],
    ['observability-for-migrations', '2026-01-23T18:00:00.000Z', 'January 23, 2026'],
  ]) {
    const time = `<time datetime="${timestamp}">${date}</time>`;
    const html = readFileSync(`dist/posts/${slug}/index.html`, 'utf8');
    assert.equal(html.match(/<time\b[^>]*>[^<]*<\/time>/)?.[0], time, `${slug}: ${date}`);
    assert.ok(index.includes(time), `Posts index: ${date}`);
  }
});
