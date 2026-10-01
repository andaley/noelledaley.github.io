import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://adriannedaley.com',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: { shikiConfig: { theme: 'github-light-high-contrast' } },
  integrations: [mdx(), react(), sitemap()],
});
