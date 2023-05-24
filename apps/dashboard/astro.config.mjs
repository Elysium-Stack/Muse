import image from '@astrojs/image';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://muse.the-river-styx.com',
	outDir: '../../dist/apps/dashboard',
	integrations: [
		react(),
		tailwind({
			config: { applyBaseStyles: false },
		}),
		image(),
	],
});
