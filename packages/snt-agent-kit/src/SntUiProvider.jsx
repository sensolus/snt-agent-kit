import { createContext, useContext, useMemo } from 'react'

/**
 * Default backend adapter: assumes the host app exposes a Flask/Express proxy
 * at /api/* (matches the layout scaffolded by @sensolus/create-snt-agent-app).
 * Consumers with a different backend topology should pass their own `api`
 * to <SntUiProvider> to override any or all of these.
 */
const defaultApi = {
  fetchLoginInfo: async () => {
    const r = await fetch('/api/loginInfo')
    return r.ok ? r.json() : null
  },
  fetchGeozones: async (orgId) => {
    const r = await fetch(`/api/geozones?orgId=${encodeURIComponent(orgId)}`)
    return r.ok ? r.json() : []
  },
  geocode: async (query) => {
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
    return r.ok ? r.json() : []
  },
  reverseGeocode: async (lat, lng) => {
    const r = await fetch(`/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`)
    return r.ok ? r.json() : null
  },
}

const SntUiContext = createContext({ api: defaultApi, navigate: null })

/**
 * Inject backend + navigation adapters into the snt-ui widget tree.
 *
 * @param {object} props
 * @param {object} [props.api]     - Override any of: fetchLoginInfo, fetchGeozones, geocode, reverseGeocode.
 *                                   Each unspecified entry falls back to a same-origin `/api/*` call.
 * @param {function} [props.navigate] - (to: string|number) => void
 *                                   Wire to react-router-dom's useNavigate, Next.js router, etc.
 *                                   When omitted, SntPageHeader falls back to window.history.
 */
export function SntUiProvider({ api, navigate, children }) {
  const value = useMemo(
    () => ({ api: { ...defaultApi, ...(api || {}) }, navigate: navigate || null }),
    [api, navigate]
  )
  return <SntUiContext.Provider value={value}>{children}</SntUiContext.Provider>
}

export function useSntUi() {
  return useContext(SntUiContext)
}
