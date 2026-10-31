import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // three.js alone is ~540 kB minified; keep the warning threshold above it
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
