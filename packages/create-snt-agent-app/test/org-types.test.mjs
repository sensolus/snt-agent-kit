// org-types.mjs: who may add a new app (app.allowedOrgTypes in sensolus-app.yaml), set
// from the organisation of the API key the scaffolder is given.
//
//   node --test packages/create-snt-agent-app/test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { allowedOrgTypesFor, fetchOrganisationType, setAllowedOrgTypes } from '../org-types.mjs'

const TEMPLATE = new URL('../template/sensolus-app.yaml', import.meta.url)

test('a key opens its own type and every type below it', () => {
  assert.deepEqual(allowedOrgTypesFor('NORMAL'), { normal: true, master: false, partner: false, system: false })
  assert.deepEqual(allowedOrgTypesFor('MASTER_ORG'), { normal: true, master: true, partner: false, system: false })
  assert.deepEqual(allowedOrgTypesFor('PARTNER'), { normal: true, master: true, partner: true, system: false })
  assert.deepEqual(allowedOrgTypesFor('SYSTEM'), { normal: true, master: true, partner: true, system: false })
})

test('a type without a scope sets nothing', () => {
  assert.equal(allowedOrgTypesFor('STOCK'), null)
  assert.equal(allowedOrgTypesFor(undefined), null)
})

test('the template ships customer organisations only', async () => {
  const text = await readFile(TEMPLATE, 'utf8')
  assert.match(text, /^schemaVersion: 2\.1$/m)
  assert.match(text, /^ {4}normal: true$/m)
  for (const type of ['master', 'partner', 'system']) assert.match(text, new RegExp(`^ {4}${type}: false$`, 'm'))
})

test('the switches are rewritten in place and nothing else changes', async () => {
  const text = await readFile(TEMPLATE, 'utf8')
  const out = setAllowedOrgTypes(text, allowedOrgTypesFor('PARTNER'))
  assert.match(out, /^ {4}master: true$/m)
  assert.match(out, /^ {4}partner: true$/m)
  assert.match(out, /^ {4}system: false$/m)
  assert.equal(out.split('\n').length, text.split('\n').length)
  assert.equal(setAllowedOrgTypes(out, allowedOrgTypesFor('NORMAL')), text)
})

test('a descriptor without the switches is refused, not half-written', () => {
  assert.throws(() => setAllowedOrgTypes('app:\n  orgType: normal\n', allowedOrgTypesFor('NORMAL')), /no "normal: true\|false" line/)
})

function answer(status, body) {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    return { ok: status >= 200 && status < 300, status, text: async () => body }
  }
  return { fetchImpl, calls }
}

test("the key's organisation type comes from loginInfo, with the key as a Bearer token", async () => {
  const { fetchImpl, calls } = answer(200, JSON.stringify({ organisationType: 'PARTNER' }))
  assert.equal(await fetchOrganisationType({ domain: 'https://dev.sensolus.com/', apiKey: 'k', fetchImpl }), 'PARTNER')
  assert.equal(calls[0].url, 'https://dev.sensolus.com/rest/api/v2/loginInfo')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer k')
})

test('a refused call or an answer without the type is an error', async () => {
  await assert.rejects(fetchOrganisationType({ domain: 'x.io', apiKey: 'k', fetchImpl: answer(401, '').fetchImpl }), /HTTP 401/)
  await assert.rejects(fetchOrganisationType({ domain: 'x.io', apiKey: 'k', fetchImpl: answer(200, '{}').fetchImpl }), /organisation type/)
  await assert.rejects(fetchOrganisationType({ domain: 'x.io', apiKey: 'k', fetchImpl: answer(200, '<html>').fetchImpl }), /organisation type/)
})
