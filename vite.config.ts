import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js is split into the lazily loaded SceneCanvas chunk, so its size
    // does not delay the page content. Raise the warning threshold to match.
    chunkSizeWarningLimit: 1300,
  },
});
