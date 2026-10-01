import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import test from 'node:test';

const origin = 'https://adriannedaley.com';
const pages = globSync('dist/**/*.html');
const posts = globSync('_posts/*.{md,mdx}');

test('every post has a static page, index entry, and feed entry', () => {
  assert.ok(posts.length > 0);
  const index = readFileSync('dist/writing/index.html', 'utf8');
  const feed = readFileSync('dist/feed.xml', 'utf8');
  assert.equal((feed.match(/<item>/g) ?? []).length, posts.length);
  for (const post of posts) {
    const slug = post.split(sep).at(-1).replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx?$/, '');
    const url = `/writing/${slug}/`;
    assert.ok(existsSync(`dist${url}index.html`), post);
    assert.ok(index.includes(`href="${url}"`), post);
    assert.ok(feed.includes(`<link>${origin}${url}</link>`), post);
  }
});

test('pages contain static content, canonical metadata, and a focusable skip target', () => {
  assert.ok(pages.length >= posts.length + 5);
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
