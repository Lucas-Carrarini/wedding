import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://lucascarrarini.com',
  base: '/wedding',
  outDir: '../wedding',
  trailingSlash: 'ignore',
  integrations: [react(), tailwind()],
  devToolbar: {
    enabled: false,
  },
});
