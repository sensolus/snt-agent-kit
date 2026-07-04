import { createContext, useContext, useEffect, useState } from 'react'
import { SntLoadingOverlay } from '@sensolus/snt-agent-kit'

/**
 * Fetches runtime config (map tile keys, etc.) from the Flask backend's
 * /api/config endpoint and gates the app on it. Lets one Docker image
 * deploy across environments — keys come from the container's env vars
 * at runtime instead of being baked into the bundle at `vite build` time.
 */
const AppConfigContext = createContext(null)

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/config')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { if (!cancelled) setConfig(data) })
      .catch(err => { if (!cancelled) setError(err) })
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <div style={{ padding: 40, color: 'var(--snt-red)' }}>
        Failed to load app config from /api/config: {error.message}
      </div>
    )
  }
  if (!config) return <SntLoadingOverlay message="Loading config..." />

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  )
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext)
  if (!ctx) throw new Error('useAppConfig must be used inside AppConfigProvider')
  return ctx
}
