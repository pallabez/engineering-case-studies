import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pallabez.github.io',
  base: '/engineering-case-studies/',
  output: 'static',
  devToolbar: { enabled: false },
});
