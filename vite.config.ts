import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves project sites under /<repo-name>/.
  base: '/onde-comer/',
  build: {
    rollupOptions: {
      input: { main: 'index.html', en: 'en/index.html' },
    },
  },
});
