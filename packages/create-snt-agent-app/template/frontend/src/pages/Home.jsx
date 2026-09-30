import { useState, useEffect, useRef } from 'react'
import { SntTabs, SntTabPanel, SntDialog, SntButton, SntInput, SntPageHeader } from '@sensolus/snt-agent-kit'
import { useLocale } from '../i18n'
import { Helloworld } from './Helloworld'
import { DeviceBrowser } from './DeviceBrowser'
import { WidgetShowcase } from './WidgetShowcase'

export function Home() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState('helloworld')
  const [authReady, setAuthReady] = useState(false)
  const [hasCookieToken, setHasCookieToken] = useState(false)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const devicesReloadRef = useRef(null)
  const [devicesLoading, setDevicesLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.hasSessionToken) {
          setHasCookieToken(true)
          setAuthReady(true)
        } else if (data.hasStoredApiKey) {
          setAuthReady(true)
        } else {
          setShowApiKeyDialog(true)
        }
      })
      .catch(() => {
        if (!cancelled) setShowApiKeyDialog(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const submitApiKey = async () => {
    const key = apiKeyInput.trim()
    if (!key) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const r = await fetch('/api/auth/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      })
      const data = await r.json()
      if (!r.ok) {
        setSubmitError(data.error || t('auth.dialog.failed'))
        return
      }
      setAuthReady(true)
      setShowApiKeyDialog(false)
      setApiKeyInput('')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openApiKeyDialog = () => {
    setSubmitError('')
    setApiKeyInput('')
    setShowApiKeyDialog(true)
  }

  const tabs = [
    { key: 'helloworld', label: t('home.tab.helloworld') },
    { key: 'showcase', label: t('home.tab.showcase') },
    { key: 'devices', label: t('home.tab.devices') },
  ]

  const headerActions = (
    <div className="header-actions">
      {!hasCookieToken && (
        <SntButton variant="secondary" onClick={openApiKeyDialog}>
          {t('auth.changeApiKey')}
        </SntButton>
      )}
      {activeTab === 'devices' && (
        <SntButton
          onClick={() => devicesReloadRef.current?.()}
          disabled={devicesLoading || !authReady}
        >
          {devicesLoading ? t('common.loading') : t('common.reload')}
        </SntButton>
      )}
    </div>
  )

  return (
    <div className="home-page">
      <SntPageHeader title="Sample app" actions={headerActions} />
      <SntTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
        <SntTabPanel tabKey="helloworld" activeTab={activeTab}>
          <Helloworld authReady={authReady} />
        </SntTabPanel>
        <SntTabPanel tabKey="showcase" activeTab={activeTab}>
          <WidgetShowcase />
        </SntTabPanel>
        <SntTabPanel tabKey="devices" activeTab={activeTab}>
          <DeviceBrowser
            authReady={authReady}
            reloadRef={devicesReloadRef}
            onLoadingChange={setDevicesLoading}
          />
        </SntTabPanel>
      </SntTabs>

      <SntDialog
        open={showApiKeyDialog}
        onClose={() => {
          if (authReady) setShowApiKeyDialog(false)
        }}
        title={t('auth.dialog.title')}
        size="small"
      >
        <p>{t('auth.dialog.description')}</p>
        <SntInput
          type="password"
          placeholder={t('auth.apiKeyPlaceholder')}
          value={apiKeyInput}
          onChange={setApiKeyInput}
          onKeyPress={(e) => {
            if (e.key === 'Enter') submitApiKey()
          }}
        />
        {submitError && (
          <div className="error" style={{ marginTop: 8 }}>
            {submitError}
          </div>
        )}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          {/* In forms the blue (emphasis) action comes first, white second —
              an intentional exception to the white-is-primary guideline. */}
          <SntButton
            variant="emphasis"
            onClick={submitApiKey}
            disabled={submitting || !apiKeyInput.trim()}
          >
            {submitting ? t('common.loading') : t('common.save')}
          </SntButton>
          {authReady && (
            <SntButton
              variant="secondary"
              onClick={() => setShowApiKeyDialog(false)}
              disabled={submitting}
            >
              {t('common.cancel')}
            </SntButton>
          )}
        </div>
      </SntDialog>
    </div>
  )
}
