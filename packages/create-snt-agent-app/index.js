#!/usr/bin/env node
/**
 * npm create @sensolus/snt-agent-app my-app
 *
 * Copies the template into ./my-app, substituting {{APP_NAME}}.
 * Files prefixed with _ are renamed to dotfiles (npm publish strips real dotfiles).
 */
import { cp, readdir, readFile, writeFile, rename, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const templateDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'template')

const rawName = process.argv[2]
if (!rawName) {
  console.error('Usage: npm create @sensolus/snt-agent-app <app-name>')
  process.exit(1)
}
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

  Optional — richer maps in SntMap (falls back to OpenStreetMap without either key):
    cp .env.example .env
      MAPBOX_KEY      → enables the satellite layer + toggle
      LOCATIONIQ_KEY  → enables the geocoder and premium street tiles

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
