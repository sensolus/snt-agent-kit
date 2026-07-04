import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Dev-time aliases that bypass the kit's published `dist/` build:
//   @sensolus/snt-agent-kit       → ../snt-agent-kit/src/index.js
//   @sensolus/snt-agent-kit/theme.css → ../snt-agent-kit/src/styles/snt-theme.css
// This way edits to kit source HMR into the showcase without running
// `npm run build`. Real apps consume the package via its normal `exports`
// (from dist/), so this aliasing is showcase-only.
const kitSrc = fileURLToPath(new URL('../snt-agent-kit/src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@sensolus/snt-agent-kit/theme.css', replacement: `${kitSrc}/styles/snt-theme.css` },
      { find: '@sensolus/snt-agent-kit', replacement: `${kitSrc}/index.js` },
    ],
  },
  server: {
    port: 3100,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
})
