import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://chi2027-provenance-workshop.workers.dev',
  output: 'static',
  integrations: [react()],
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  session: false,
});
