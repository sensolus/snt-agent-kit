import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Library build: minified, no sourcemaps — published code is intentionally
// "not yours to edit" (see monorepo README).
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'snt-agent-kit',
      cssFileName: 'snt-agent-kit',
    },
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      // Consumers provide react; leaflet stays a regular dependency of this
      // package but is not bundled (the app's bundler resolves it).
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^leaflet/,
      ],
    },
  },
})
