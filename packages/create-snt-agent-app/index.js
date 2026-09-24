#!/usr/bin/env node
/**
 * npm create @sensolus/snt-agent-app my-app [-- --api-key <key>] [--domain <domain>] [--skip-openapi]
 *
 * Copies the template into ./my-app, substituting {{APP_NAME}}.
 * Files prefixed with _ are renamed to dotfiles (npm publish strips real dotfiles).
 * Then downloads openapi.json, the Sensolus API spec tailored to an API key of the
 * organisation the app is for, with the app's own scripts/update-openapi.mjs.
 */
import { cp, readdir, readFile, writeFile, rename, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEFAULT_DOMAIN, fetchOpenApi, normalizeDomain, parseArgs, setEnvValues } from './template/scripts/update-openapi.mjs'

const templateDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'template')

const rawName = process.argv[2]
if (!rawName || rawName.startsWith('--')) {
  console.error('Usage: npm create @sensolus/snt-agent-app <app-name> [-- --api-key <key>] [--domain <domain>] [--skip-openapi]')
  process.exit(1)
}
const options = parseArgs(process.argv.slice(3))
const appName = rawName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
const targetDir = path.resolve(process.cwd(), appName)

if (existsSync(targetDir)) {
  console.error(`Error: directory ${appName} already exists.`)
  process.exit(1)
}

await cp(templateDir, targetDir, { recursive: true })

// Rename _gitignore -> .gitignore etc.
for (const entry of await readdir(targetDir)) {
  if (entry.startsWith('_')) {
    await rename(path.join(targetDir, entry), path.join(targetDir, '.' + entry.slice(1)))
  }
}

// Substitute {{APP_NAME}} in text files
async function substitute(dir) {
  for (const entry of await readdir(dir)) {
    const p = path.join(dir, entry)
    if ((await stat(p)).isDirectory()) { await substitute(p); continue }
    if (!/\.(json|js|jsx|html|md|py|txt|sh|css|yml|yaml|ini|mako)$|^\.[a-z][a-z.]*$|^(Jenkinsfile|Dockerfile|Makefile)$/i.test(entry)) continue
    const content = await readFile(p, 'utf8')
    if (content.includes('{{APP_NAME}}')) {
      await writeFile(p, content.replaceAll('{{APP_NAME}}', appName))
    }
  }
}
await substitute(targetDir)

// openapi.json is the API spec tailored to one API key, so it is fetched for this app
// rather than shipped in the template. Returns a line for the summary, or null.
async function downloadOpenApi({ domain, apiKey, skipOpenApi }) {
  if (skipOpenApi) return null
  if (!apiKey && process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    try {
      domain = domain || (await rl.question(`Sensolus platform domain [${DEFAULT_DOMAIN}]: `)).trim() || undefined
      apiKey = (await rl.question('API key of the organisation this app is for, with the role the app needs, to download its API spec (Enter to skip): ')).trim() || undefined
    } finally {
      rl.close()
    }
  }
  if (!apiKey) return null
  // The bare host, also in .env: the app's backend builds its API URL from SENSOLUS_DOMAIN.
  domain = normalizeDomain(domain || DEFAULT_DOMAIN)
  try {
    const { text, version } = await fetchOpenApi({ domain, apiKey })
    await writeFile(path.join(targetDir, 'openapi.json'), text)
    // Into .env (gitignored), so scripts/update-openapi.mjs can refresh the spec later.
    const envExample = await readFile(path.join(targetDir, '.env.example'), 'utf8')
    await writeFile(path.join(targetDir, '.env'),
      setEnvValues(envExample, { SENSOLUS_DOMAIN: domain, SENSOLUS_API_KEY: apiKey }))
    return `downloaded from ${domain} (platform release ${version || 'unknown'}); domain and key saved in .env`
  } catch (error) {
    console.warn(`\n⚠  Could not download openapi.json: ${error.message}\n`)
    return null
  }
}
const openApi = await downloadOpenApi(options)

// Create Python virtual environment in backend/.venv (stdlib venv, Python 3.3+)
const backendDir = path.join(targetDir, 'backend')
if (existsSync(backendDir)) {
  const python = process.platform === 'win32' ? 'python' : 'python3'
  console.log('Creating backend virtual environment (backend/.venv)…')
  const venvRes = spawnSync(python, ['-m', 'venv', '.venv'], {
    cwd: backendDir,
    stdio: 'inherit',
  })
  if (venvRes.error || venvRes.status !== 0) {
    console.warn(`
⚠  Could not create backend virtual environment (${venvRes.error ? `${python} not found` : `exit ${venvRes.status}`}).
   Create it manually with:  cd ${appName}/backend && ${python} -m venv .venv
`)
  }
}

console.log(`
Created ${appName}/

Next steps:
  cd ${appName}

  API spec — openapi.json: ${openApi || 'not downloaded yet'}.
    It is tailored to one API key, so it is gitignored and never edited.
    Fetch it, and refresh it after every platform release, with:
      node scripts/update-openapi.mjs     # SENSOLUS_DOMAIN and SENSOLUS_API_KEY from .env

  Database — start a local PostgreSQL (PostGIS) with Docker Compose:
    docker compose -f infra/docker-compose.yml up -d
      Defaults: host localhost:5432, db ${appName}, user/password snt/snt.
      Stop with:  docker compose -f infra/docker-compose.yml down
                  (add -v to also wipe the data volume)

    Don't need a database? Set  features.database: false  in sensolus-app.yaml,
    remove the favourites (models.py, /api/favourites) and skip the step above.

  Run it:
    • Recommended — open the folder in VS Code and run the build task
      "Start Dev (Frontend + Backend)" (Ctrl+Shift+B). It installs deps
      and starts both servers side by side.

    • Or from a terminal — one-time install, then start:
        cd frontend && npm install && cd ..
        backend/.venv/bin/pip install -r backend/requirements.txt
        ./start-frontend.sh    # Vite on :3000
        ./start-backend.sh     # Flask on :5000  (separate terminal)

Rules: widgets/theme/i18n come from @sensolus/snt-agent-kit — import, don't copy.
ESLint enforces no deep imports and no Snt* re-declarations.
`)
