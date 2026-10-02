// template/scripts/update-openapi.mjs: how a scaffolded app downloads the Sensolus API
// spec tailored to its API key, and what the scaffolder runs once when it creates the app.
//
//   node --test packages/create-snt-agent-app/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_DOMAIN,
  fetchOpenApi,
  normalizeDomain,
  openApiUrl,
  parseArgs,
  parseEnv,
  setEnvValues,
} from '../template/scripts/update-openapi.mjs'

const SPEC = {
  openapi: '3.0.1',
  info: { title: 'Platform API', version: '6.2.0' },
  paths: { '/api/v2/devices': {} },
}

function answer(status, body) {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    return { ok: status >= 200 && status < 300, status, text: async () => body }
  }
  return { fetchImpl, calls }
}

test('the spec comes from the v2 API of the platform', () => {
  assert.equal(openApiUrl('cloud.sensolus.com'), 'https://cloud.sensolus.com/rest/api/v2/openapi.json')
  assert.equal(DEFAULT_DOMAIN, 'cloud.sensolus.com')
})

test('the domain may be a host, a URL, or a link copied from the browser', () => {
  for (const typed of [
    'dev.sensolus.com',
    ' dev.sensolus.com ',
    'dev.sensolus.com/',
    'https://dev.sensolus.com',
    'https://dev.sensolus.com/',
    'https://dev.sensolus.com/api-access?tabActive=agent&org=1',
  ]) {
    assert.equal(normalizeDomain(typed), 'dev.sensolus.com', typed)
    assert.equal(openApiUrl(typed), 'https://dev.sensolus.com/rest/api/v2/openapi.json', typed)
  }
  assert.equal(normalizeDomain('localhost:8443'), 'localhost:8443')
})

test('a platform that cannot be reached says why', async () => {
  // fetch reports only "fetch failed"; the reason is its cause.
  const unreachable = (code, message) => async () => {
    throw new TypeError('fetch failed', { cause: Object.assign(new Error(message), { code }) })
  }
  await assert.rejects(
    fetchOpenApi({
      domain: 'no-such.sensolus.com',
      apiKey: 'k',
      fetchImpl: unreachable('ENOTFOUND', 'getaddrinfo ENOTFOUND no-such.sensolus.com'),
    }),
    /could not be reached: getaddrinfo ENOTFOUND no-such\.sensolus\.com\. Is no-such\.sensolus\.com the right platform domain\?/,
  )
  // A known host that refuses the connection is not a typo: no question about the domain.
  await assert.rejects(
    fetchOpenApi({
      domain: 'dev.sensolus.com',
      apiKey: 'k',
      fetchImpl: unreachable('ECONNREFUSED', 'connect ECONNREFUSED 10.0.0.1:443'),
    }),
    (error) => /could not be reached: connect ECONNREFUSED 10\.0\.0\.1:443/.test(error.message)
      && !/right platform domain/.test(error.message),
  )
})

test('the key travels as a Bearer token, never in the URL', async () => {
  const { fetchImpl, calls } = answer(200, JSON.stringify(SPEC))
  await fetchOpenApi({ domain: 'dev.sensolus.com', apiKey: 'k-123', fetchImpl })
  assert.equal(calls[0].url, 'https://dev.sensolus.com/rest/api/v2/openapi.json')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer k-123')
  assert.ok(!calls[0].url.includes('k-123'))
})

test('the document comes back pretty-printed, with the release it describes', async () => {
  const { fetchImpl } = answer(200, JSON.stringify(SPEC))
  const { text, version } = await fetchOpenApi({ apiKey: 'k', fetchImpl })
  assert.deepEqual(JSON.parse(text), SPEC)
  assert.ok(text.endsWith('}\n'))
  assert.equal(version, '6.2.0')
})

test('without a key there is nothing to ask for', async () => {
  const { fetchImpl, calls } = answer(200, JSON.stringify(SPEC))
  await assert.rejects(fetchOpenApi({ apiKey: '', fetchImpl }), /API key is required/)
  assert.equal(calls.length, 0)
})

test('a refused key says so', async () => {
  const { fetchImpl } = answer(401, '{"error":"Invalid api key"}')
  await assert.rejects(fetchOpenApi({ apiKey: 'bad', fetchImpl }), /HTTP 401/)
})

test('an HTML page is not taken for the spec', async () => {
  // The platform answers an unknown path with 200 and its single-page app, so a wrong
  // domain or path looks like success until the body is read.
  const { fetchImpl } = answer(200, '<!doctype html><html></html>')
  await assert.rejects(fetchOpenApi({ apiKey: 'k', fetchImpl }), /did not return JSON/)
})

test('JSON that is not an OpenAPI document is refused', async () => {
  const { fetchImpl } = answer(200, '{"error":"nope"}')
  await assert.rejects(fetchOpenApi({ apiKey: 'k', fetchImpl }), /not an OpenAPI document/)
})

test('flags: --domain, --api-key in both spellings, --skip-openapi', () => {
  assert.deepEqual(parseArgs(['--domain', 'dev.sensolus.com', '--api-key=k-1', '--skip-openapi']), {
    domain: 'dev.sensolus.com',
    apiKey: 'k-1',
    skipOpenApi: true,
  })
  assert.deepEqual(parseArgs(['--api-key', 'k-2']), { domain: undefined, apiKey: 'k-2', skipOpenApi: false })
  assert.deepEqual(parseArgs([]), { domain: undefined, apiKey: undefined, skipOpenApi: false })
})

test('.env values are read, comments and quotes aside', () => {
  assert.deepEqual(
    parseEnv('# comment\nSENSOLUS_DOMAIN=dev.sensolus.com\nSENSOLUS_API_KEY="k 1"\n\n#DB_HOST=x\nURL=a=b\n'),
    { SENSOLUS_DOMAIN: 'dev.sensolus.com', SENSOLUS_API_KEY: 'k 1', URL: 'a=b' },
  )
})

test('.env values are set where the key is, and appended where it is not', () => {
  const env = '# keep me\nSENSOLUS_DOMAIN=cloud.sensolus.com\nSENSOLUS_API_KEY=\n#DB_HOST=localhost\nMAPBOX_KEY=\n'
  assert.equal(
    setEnvValues(env, { SENSOLUS_API_KEY: 'k-1', DB_HOST: 'db' }),
    '# keep me\nSENSOLUS_DOMAIN=cloud.sensolus.com\nSENSOLUS_API_KEY=k-1\n#DB_HOST=localhost\nMAPBOX_KEY=\nDB_HOST=db\n',
  )
})

// --- the scaffolder itself ---------------------------------------------------------------

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import net from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCAFFOLDER = fileURLToPath(new URL('../index.js', import.meta.url))

function scaffold(...args) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'snt-scaffold-'))
  const run = spawnSync(process.execPath, [SCAFFOLDER, 'demo-app', ...args], { cwd, encoding: 'utf8' })
  return { run, app: path.join(cwd, 'demo-app'), cleanup: () => rmSync(cwd, { recursive: true, force: true }) }
}

/** A local port nothing listens on, so a connection to it is refused at once. */
async function closedPort() {
  const server = net.createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  await new Promise((resolve) => server.close(resolve))
  return port
}

test('--skip-openapi creates the app without a spec, and says what that costs', () => {
  const { run, app, cleanup } = scaffold('--skip-openapi')
  try {
    assert.equal(run.status, 0, run.stderr)
    assert.ok(!existsSync(path.join(app, 'openapi.json')), 'the template no longer ships one')
    assert.ok(existsSync(path.join(app, 'scripts', 'update-openapi.mjs')))
    assert.match(readFileSync(path.join(app, '.gitignore'), 'utf8'), /^openapi\.json$/m)
    assert.match(readFileSync(path.join(app, '.env.example'), 'utf8'), /^SENSOLUS_API_KEY=$/m)
    assert.match(run.stdout, /SKIPPED/, 'the summary does not let it pass unnoticed')
    assert.match(run.stdout, /node scripts\/update-openapi\.mjs/)
  } finally {
    cleanup()
  }
})

test('no key and no terminal to ask: nothing is created', () => {
  // spawnSync gives the child no TTY, so this is the CI case.
  const { run, app, cleanup } = scaffold()
  try {
    assert.equal(run.status, 1, 'the run fails')
    assert.match(run.stderr, /an API key is required/i)
    assert.match(run.stderr, /--skip-openapi/, 'the deliberate way out is named')
    assert.ok(!existsSync(app), 'no half-made app is left behind')
  } finally {
    cleanup()
  }
})

test('a download that fails leaves no app behind', async () => {
  // The connection is refused at once. Without a TTY there is nobody to re-ask, so one attempt.
  const { run, app, cleanup } = scaffold('--domain', `127.0.0.1:${await closedPort()}`, '--api-key', 'k-test')
  try {
    assert.equal(run.status, 1, 'a missing spec is a failed scaffold')
    assert.match(run.stdout + run.stderr, /Could not download openapi\.json/)
    assert.match(run.stdout + run.stderr, /ECONNREFUSED/, 'the warning says why')
    assert.match(run.stdout + run.stderr, /--skip-openapi/, 'and how to proceed anyway')
    assert.ok(!existsSync(app), 'the app is removed rather than left without a spec')
  } finally {
    cleanup()
  }
})

test('the scaffolder takes the domain as the browser shows it', async () => {
  const port = await closedPort()
  const { run, cleanup } = scaffold('--domain', `https://127.0.0.1:${port}/`, '--api-key', 'k-test')
  try {
    assert.equal(run.status, 1, run.stderr)
    assert.ok(
      (run.stdout + run.stderr).includes(`https://127.0.0.1:${port}/rest/api/v2/openapi.json could not be reached`),
      run.stdout + run.stderr,
    )
  } finally {
    cleanup()
  }
})
