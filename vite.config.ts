import { defineConfig } from 'vite';
import { localizeHtml } from './src/i18n/html.ts';

export default defineConfig({
  // GitHub Pages serves project sites under /<repo-name>/.
  base: '/onde-comer/',
  plugins: [
    {
      // Bakes each page's translated text into its HTML (pt-BR by default) for SEO.
      name: 'localize-html',
      transformIndexHtml: { order: 'pre', handler: localizeHtml },
    },
  ],
  build: {
    rollupOptions: {
      input: { main: 'index.html', en: 'en/index.html' },
    },
  },
});
