import { useEffect, useState } from 'react'
import { SntCard, SntLoadingOverlay, SntMessage } from '@sensolus/snt-agent-kit'
import { useLocale } from '../i18n'

/**
 * Helloworld: who is looking at this app, and for which organisation.
 *
 * Everything here comes from one call, /api/loginInfo, which the backend forwards
 * to the Sensolus API with the viewer's session (or the API key they entered).
 * A customer-specific app starts from this: the organisation shown is the one the
 * app is built for.
 */
export function Helloworld({ authReady }) {
  const { t } = useLocale()
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authReady) return undefined
    let cancelled = false
    fetch('/api/loginInfo')
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'fetchFailed')
        return data
      })
      .then((data) => {
        if (!cancelled) setInfo(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [authReady])

  if (error) {
    return (
      <div className="page-container">
        <div className="error">{error === 'fetchFailed' ? t('helloworld.fetchFailed') : error}</div>
      </div>
    )
  }
  if (!info) return <SntLoadingOverlay message={t('common.loading')} />

  const name = info.fullName || info.username || info.apiKeyName
  const rows = [
    ['helloworld.user', name],
    ['helloworld.email', info.email],
    ['helloworld.signedInWith', info.authType],
    ['helloworld.organisation', info.organisationName],
    ['helloworld.organisationType', info.organisationType],
    ['helloworld.partner', info.partnerName],
    ['helloworld.language', info.language],
    ['helloworld.timezone', info.timezone],
  ]

  return (
    <div className="page-container">
      <SntCard title={t('helloworld.title', name)}>
        <p>{t('helloworld.intro')}</p>
        <div className="item-details">
          {rows.map(([key, value]) => (
            <div className="item-stat" key={key}>
              <span className="stat-label">{t(key)}</span>
              <span className="stat-value">{value || '-'}</span>
            </div>
          ))}
        </div>
      </SntCard>
      {/* sensolus-app.yaml says orgType: normal. The platform only lets a normal
          organisation add the app; a Sensolus or partner user can still open it. */}
      {info.organisationType && info.organisationType !== 'NORMAL' && (
        <SntMessage variant="warning">{t('helloworld.notNormal')}</SntMessage>
      )}
    </div>
  )
}
