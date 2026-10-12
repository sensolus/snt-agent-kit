import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Dev-time aliases that bypass the kit's published `dist/` build:
//   @sensolus/snt-agent-kit       → ../snt-agent-kit/src/index.js
//   @sensolus/snt-agent-kit/theme.css → ../snt-agent-kit/src/styles/snt-theme.css
// This way edits to kit source HMR into the showcase without running
// `npm run build`. Real apps consume the package via its normal `exports`
// (from dist/), so this aliasing is showcase-only.
const kitSrc = fileURLToPath(new URL('../snt-agent-kit/src', import.meta.url))

// Dev stand-in for the generated app's Flask /api/site-maps route: forwards to
// the Sensolus API with SENSOLUS_API_KEY from .env and makes each image's
// relative downloadUrl absolute. The key stays in this Node process.
function sensolusSiteMapsProxy(env) {
  return {
    name: 'sensolus-site-maps-proxy',
    configureServer(server) {
      server.middlewares.use('/api/site-maps', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        const domain = env.SENSOLUS_DOMAIN || 'cloud.sensolus.com'
        if (!env.SENSOLUS_API_KEY) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Set SENSOLUS_API_KEY in packages/widget-showcase/.env' }))
          return
        }
        const query = new URL(req.url, 'http://localhost').searchParams
        query.set('apiKey', env.SENSOLUS_API_KEY)
        try {
          const upstream = await fetch(`https://${domain}/rest/api/v2/site-maps?${query}`)
          const data = await upstream.json()
          if (Array.isArray(data)) {
            for (const siteMap of data) {
              const url = siteMap.image?.downloadUrl
              if (url?.startsWith('/')) siteMap.image.downloadUrl = `https://${domain}${url}`
            }
          }
          res.statusCode = upstream.status
          res.end(JSON.stringify(data))
        } catch (error) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: String(error) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), sensolusSiteMapsProxy(loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'SENSOLUS_'))],
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
}))
