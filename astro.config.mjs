import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pallab.fyi',
  base: '/',
  output: 'static',
  devToolbar: { enabled: false },
});
