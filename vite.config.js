import { defineConfig } from 'vite';

export default defineConfig({
  // The public preview tunnel forwards its own Host header to the local server.
  preview: { allowedHosts: true },
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
