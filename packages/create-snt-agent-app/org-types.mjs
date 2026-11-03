/**
 * Who may add a new app: the four switches under app.allowedOrgTypes in its
 * sensolus-app.yaml. The scaffolder sets them from the organisation of the API key it is
 * given, which /api/v2/loginInfo names.
 */
import { normalizeDomain } from './template/scripts/update-openapi.mjs'

export const ORG_TYPE_SWITCHES = ['normal', 'master', 'partner', 'system']

// A key opens its own type and every type below it: partner > master > normal. A system
// key opens the same three, not `system`: the organisation that owns an app may always
// add it, so `system` only lets the System organisation add an app someone else owns.
const SCOPES = {
  NORMAL: ['normal'],
  MASTER_ORG: ['normal', 'master'],
  PARTNER: ['normal', 'master', 'partner'],
  SYSTEM: ['normal', 'master', 'partner'],
}

/** The switches for a key of this organisation type, or null for a type no switch covers. */
export function allowedOrgTypesFor(organisationType) {
  const on = SCOPES[organisationType]
  return on ? Object.fromEntries(ORG_TYPE_SWITCHES.map((type) => [type, on.includes(type)])) : null
}

/** NORMAL, MASTER_ORG, PARTNER, SYSTEM, …: the type of the organisation the key belongs to. */
export async function fetchOrganisationType({ domain, apiKey, fetchImpl = fetch }) {
  const url = `https://${normalizeDomain(domain)}/rest/api/v2/loginInfo`
  // A Bearer header rather than ?apiKey=, so the key stays out of URLs and their logs.
  const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${url} answered HTTP ${res.status}`)
  let type
  try {
    type = JSON.parse(await res.text())?.organisationType
  } catch {
    type = undefined
  }
  if (typeof type !== 'string' || !type) throw new Error(`${url} did not say the organisation type`)
  return type
}

/** The yaml text with the four switches set. Throws when one of their lines is missing. */
export function setAllowedOrgTypes(yamlText, allowed) {
  let text = yamlText
  for (const type of ORG_TYPE_SWITCHES) {
    const line = new RegExp(`^( +${type}: *)(true|false)$`, 'm')
    if (!line.test(text)) throw new Error(`sensolus-app.yaml has no "${type}: true|false" line under app.allowedOrgTypes`)
    text = text.replace(line, `$1${allowed[type]}`)
  }
  return text
}
