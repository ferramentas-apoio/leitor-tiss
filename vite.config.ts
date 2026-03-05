import { defineConfig } from 'vite'

export default defineConfig({
  base: '/leitor-tiss/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        compact: true,
      },
    },
  },
})
