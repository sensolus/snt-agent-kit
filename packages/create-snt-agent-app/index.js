#!/usr/bin/env node
/**
 * npm create @sensolus/snt-agent-app my-app [-- --api-key <key>] [--domain <domain>] [--skip-openapi]
 *
 * Copies the template into ./my-app, substituting {{APP_NAME}}.
 * Files prefixed with _ are renamed to dotfiles (npm publish strips real dotfiles).
 * Then downloads openapi.json, the Sensolus API spec tailored to an API key of the
 * organisation the app is for, with the app's own scripts/update-openapi.mjs.
 *
 * The spec is required: an app created without one is an app whose coding agent invents
 * endpoints its key may not call. A run that cannot get the spec creates no app at all.
 * --skip-openapi is the one way to decline it, and has to be asked for.
 */
import { cp, readdir, readFile, rm, writeFile, rename, stat } from 'node:fs/promises'
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

// An app without openapi.json is an app whose coding agent guesses at the platform's API
// from memory, and writes calls the app's key is not allowed to make. The spec is therefore
// required, and the only way to decline it is to say so. Checked before anything is created,
// so a run that cannot succeed leaves nothing behind.
if (!options.skipOpenApi && !options.apiKey && !process.stdin.isTTY) {
  console.error(`
Error: an API key is required, and there is no terminal to ask for one.

The platform tailors openapi.json to the key that asks for it — the endpoints the
key's role may call, and the fields its organisation type sees. Without it the app
is written against a spec nobody has.

  --api-key <key>   download the spec for that key
  --skip-openapi    create the app without a spec, on purpose
`)
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
// rather than shipped in the template. Resolves to a line for the summary, or null when the
// spec was declined with --skip-openapi. Throws when no spec could be had: a wrong key or a
// mistyped domain is a typo worth retrying, but an app that silently has no spec is the
// thing this is here to prevent.
const MAX_ATTEMPTS = 3

async function downloadOpenApi({ domain, apiKey, skipOpenApi }) {
  if (skipOpenApi) return null
  // Without a terminal there is nobody to re-ask, so the key given on the command line gets
  // one attempt. The guard above has already rejected a non-interactive run without one.
  const interactive = process.stdin.isTTY
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null
  let gaveUpOn = 'no-key' // or 'download': which of the two to say at the end
  try {
    for (let attempt = 1; ; attempt++) {
      if (interactive && !apiKey) {
        const fallback = domain || DEFAULT_DOMAIN
        // Normalised as it is read, not only where it is used: a domain pasted from the
        // browser would otherwise be echoed back, path and query and all, as the default
        // on the next attempt.
        domain = normalizeDomain((await rl.question(`Sensolus platform domain [${fallback}]: `)).trim() || fallback)
        // The key is not something the scaffolder can invent — it is issued by the platform,
        // and people reasonably do not know which of its pages issues one. Point at the exact
        // page for the domain just given, rather than describing where to look.
        console.log(`
The API key comes from the Sensolus platform, not from this scaffolder. Open the
API access page of the organisation this app is for and copy a key from it:

  https://${normalizeDomain(domain)}/api-access?tabActive=accounts

It is used to download openapi.json, the API spec tailored to that key. Give it the
role the app needs: a read-only key produces a spec without a single write endpoint.

The key is written to this app's .env, which is gitignored. It must never be
committed — anyone with it can act on the organisation it belongs to.
`)
        apiKey = (await rl.question('API key: ')).trim()
        if (!apiKey) {
          gaveUpOn = 'no-key'
          console.error('   An API key is required. Press Ctrl-C and re-run with --skip-openapi to create an app without a spec.')
        }
      }
      if (apiKey) {
        try {
          // The bare host, also in .env: the app's backend builds its API URL from SENSOLUS_DOMAIN.
          const host = normalizeDomain(domain || DEFAULT_DOMAIN)
          const { text, version } = await fetchOpenApi({ domain: host, apiKey })
          await writeFile(path.join(targetDir, 'openapi.json'), text)
          // Into .env (gitignored), so scripts/update-openapi.mjs can refresh the spec later.
          const envExample = await readFile(path.join(targetDir, '.env.example'), 'utf8')
          await writeFile(path.join(targetDir, '.env'),
            setEnvValues(envExample, { SENSOLUS_DOMAIN: host, SENSOLUS_API_KEY: apiKey }))
          return `downloaded from ${host} (platform release ${version || 'unknown'}); domain and key saved in .env`
        } catch (error) {
          gaveUpOn = 'download'
          console.error(`\n⚠  Could not download openapi.json: ${error.message}`)
          apiKey = undefined // ask again: the key or the domain is usually the thing that was wrong
        }
      }
      if (!interactive || attempt >= MAX_ATTEMPTS) {
        const after = interactive ? ` after ${MAX_ATTEMPTS} attempts` : ''
        throw new Error(`${gaveUpOn === 'no-key' ? `No API key given${after}` : `Could not download openapi.json${after}`}.
   The app was not created, because without the spec its coding agent would be
   writing against an API it cannot see. Fix the key or the domain and run again,
   or pass --skip-openapi to create the app without a spec on purpose.`)
      }
    }
  } finally {
    rl?.close()
  }
}

let openApi
try {
  openApi = await downloadOpenApi(options)
} catch (error) {
  console.error(`\n✖  ${error.message}\n`)
  await rm(targetDir, { recursive: true, force: true })
  process.exit(1)
}

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

  API spec — openapi.json: ${openApi || 'SKIPPED (--skip-openapi) — the app has no spec, so\n    a coding agent will be guessing at the API until you download one.'}
    It is tailored to one API key, so it is gitignored and never edited.
    Refresh it after every platform release with:
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
        ./start-backend.sh     # gunicorn on :5000  (separate terminal)

Rules: widgets/theme/i18n come from @sensolus/snt-agent-kit — import, don't copy.
ESLint enforces no deep imports and no Snt* re-declarations.
`)
