#!/usr/bin/env node
/**
 * Download the Sensolus API spec for this app into openapi.json.
 *
 * The platform tailors the document to the API key that asks for it: only the endpoints
 * the key's role, its organisation's plan and its organisation type can use, and only the
 * fields that organisation type sees. So the file belongs to one key. Never edit it, and
 * never commit it (it is gitignored). Refresh it before working against the API and after
 * every platform release: `info.version` in the file says which release it describes.
 *
 *   node scripts/update-openapi.mjs        uses SENSOLUS_DOMAIN and SENSOLUS_API_KEY from .env
 *   node scripts/update-openapi.mjs --domain dev.sensolus.com --api-key <key>
 *
 * The scaffolder (npm create @sensolus/snt-agent-app) runs the same code once, when it
 * creates the app.
 */
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const DEFAULT_DOMAIN = 'cloud.sensolus.com'

/**
 * The platform's host, however it was typed: `cloud.sensolus.com`, `https://cloud.sensolus.com/`,
 * or a link copied from the browser's address bar. The API sits at the root of the host, so a
 * scheme, a path and a query are dropped.
 */
export function normalizeDomain(domain) {
  const typed = String(domain ?? '').trim()
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(typed) ? typed : `https://${typed}`).host || typed
  } catch {
    return typed
  }
}

export function openApiUrl(domain) {
  return `https://${normalizeDomain(domain)}/rest/api/v2/openapi.json`
}

/**
 * Fetch the spec. Resolves to { text, version }: the document pretty-printed, and the
 * platform release it describes. Rejects with the reason when there is no document.
 */
export async function fetchOpenApi({ domain = DEFAULT_DOMAIN, apiKey, fetchImpl = fetch }) {
  if (!apiKey) {
    throw new Error('An API key is required: the platform tailors the document to the key that asks for it.')
  }
  const host = normalizeDomain(domain)
  const url = openApiUrl(host)
  let res
  try {
    // A Bearer header rather than ?apiKey=, so the key stays out of URLs and their logs.
    res = await fetchImpl(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } })
  } catch (error) {
    // fetch reports only "fetch failed"; the reason (an unknown host, a refused connection, a
    // certificate) is its cause. Only an unknown host points at a mistyped domain.
    const cause = error.cause ?? error
    const hint = cause.code === 'ENOTFOUND' ? ` Is ${host} the right platform domain?` : ''
    throw new Error(`${url} could not be reached: ${cause.message || cause.code || error.message}.${hint}`)
  }
  const body = await res.text()
  if (!res.ok) {
    throw new Error(`${url} answered HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  let doc
  try {
    doc = JSON.parse(body)
  } catch {
    // The platform answers an unknown path with 200 and its single-page app.
    throw new Error(`${url} did not return JSON. Is ${host} the right platform domain?`)
  }
  if (!doc || typeof doc.openapi !== 'string' || !doc.paths) {
    throw new Error(`${url} returned JSON that is not an OpenAPI document`)
  }
  return { text: `${JSON.stringify(doc, null, 2)}\n`, version: doc.info?.version }
}

/** --domain <d>, --api-key <k> (or --flag=value), --skip-openapi. Anything else is ignored. */
export function parseArgs(argv) {
  const options = { domain: undefined, apiKey: undefined, skipOpenApi: false }
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split(/=(.*)/s, 2)
    const value = () => (inline !== undefined ? inline : argv[++i])
    if (flag === '--domain') options.domain = value()
    else if (flag === '--api-key') options.apiKey = value()
    else if (flag === '--skip-openapi') options.skipOpenApi = true
  }
  return options
}

/** KEY=value lines of a .env file. Comments and blank lines are skipped; one pair of quotes is removed. */
export function parseEnv(text) {
  const values = {}
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(line)
    if (!match) continue
    let value = match[2].trim()
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
      value = value.slice(1, -1)
    }
    values[match[1]] = value
  }
  return values
}

/** Set KEY=value lines in .env text: in place where the key is set, appended where it is not. */
export function setEnvValues(text, values) {
  const pending = new Map(Object.entries(values))
  const lines = text.split('\n').map((line) => {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=/.exec(line)
    if (!match || !pending.has(match[1])) return line
    const replaced = `${match[1]}=${pending.get(match[1])}`
    pending.delete(match[1])
    return replaced
  })
  let out = lines.join('\n')
  if (pending.size > 0) {
    if (!out.endsWith('\n')) out += '\n'
    out += [...pending].map(([key, value]) => `${key}=${value}\n`).join('')
  }
  return out
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const envFile = path.join(root, '.env')
  const env = existsSync(envFile) ? parseEnv(await readFile(envFile, 'utf8')) : {}
  const args = parseArgs(process.argv.slice(2))
  const domain = normalizeDomain(args.domain || process.env.SENSOLUS_DOMAIN || env.SENSOLUS_DOMAIN || DEFAULT_DOMAIN)
  const apiKey = args.apiKey || process.env.SENSOLUS_API_KEY || env.SENSOLUS_API_KEY
  const { text, version } = await fetchOpenApi({ domain, apiKey })
  await writeFile(path.join(root, 'openapi.json'), text)
  console.log(`openapi.json updated from ${domain} (platform release ${version || 'unknown'}).`)
}

// Run as a script, not when imported (the scaffolder and the tests import it).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Could not update openapi.json: ${error.message}`)
    process.exit(1)
  })
}
