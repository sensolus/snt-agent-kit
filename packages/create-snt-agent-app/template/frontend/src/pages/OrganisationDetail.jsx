import { useParams } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import {
  SntPageHeader,
  SntBadge,
  SntProgressBar,
  SntCard,
  SntDeviceMap,
  SntSpinner,
} from '@sensolus/snt-agent-kit'
import { useLocale, formatNumber } from '../i18n'
import { useAppConfig } from '../AppConfigContext'

export function OrganisationDetail() {
  const { id } = useParams()
  const { t, intlLocale } = useLocale()
  const config = useAppConfig()

  // Try to get org data from sessionStorage
  const organisation = useMemo(() => {
    const cached = sessionStorage.getItem(`org_${id}`)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        return null
      }
    }
    return null
  }, [id])

  const [devices, setDevices] = useState([])
  const [mapLoading, setMapLoading] = useState(true)

  useEffect(() => {
    if (!organisation) return
    setMapLoading(true)

    fetch(`/api/devices/byFilter?fields=serial,name,lastLat,lastLng,lastAddress,lastLocationUpdate,deviceCategory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maxResults: 1000,
        startIndex: 0,
        filter: {
          type: 'ORGANISATION',
          ids: [String(id)],
          includedNull: false,
          includedNotNull: false
        }
      })
    })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(result => {
        const items = Array.isArray(result) ? result : (result.data || [])
        setDevices(items.filter(d => d.deviceCategory === 'TRACKER' && !(d.lastLat === 0 && d.lastLng === 0)))
        setMapLoading(false)
      })
      .catch(() => {
        setDevices([])
        setMapLoading(false)
      })
  }, [organisation, id])

  const getTypeBadgeVariant = (type) => {
    switch (type?.toUpperCase()) {
      case 'PARTNER': return 'success'
      case 'SYSTEM': return 'warning'
      default: return 'info'
    }
  }

  // Format a value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no')
    if (typeof value === 'number') return formatNumber(value, intlLocale)
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  // Flatten an object into key-value pairs
  const flattenObject = (obj, prefix = '') => {
    const result = []
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result.push(...flattenObject(value, fullKey))
      } else {
        result.push({ key: fullKey, value })
      }
    }
    return result
  }

  // Group fields by category
  const categorizeFields = (org) => {
    const basicInfo = []
    const statistics = []
    const metrics = []
    const other = []

    const allFields = flattenObject(org)

    for (const field of allFields) {
      const key = field.key.toLowerCase()
      if (key.startsWith('statistics.metrics.')) {
        metrics.push({
          ...field,
          label: field.key.replace('statistics.metrics.', '').replace(/_/g, ' ')
        })
      } else if (key.startsWith('statistics.')) {
        statistics.push({
          ...field,
          label: field.key.replace('statistics.', '').replace(/([A-Z])/g, ' $1').trim()
        })
      } else if (['id', 'name', 'organisationtype', 'locked', 'platformplan', 'region', 'segment'].includes(key)) {
        basicInfo.push({
          ...field,
          label: field.key.replace(/([A-Z])/g, ' $1').trim()
        })
      } else {
        other.push({
          ...field,
          label: field.key.replace(/([A-Z])/g, ' $1').trim()
        })
      }
    }

    return { basicInfo, statistics, metrics, other }
  }

  if (!organisation) {
    return (
      <div className="page-container">
        <SntPageHeader title={t('orgDetail.notFound')} backTo="/" />
        <div className="empty-state">
          <h3>{t('orgDetail.notAvailable')}</h3>
          <p>{t('orgDetail.goBackPrompt')}</p>
        </div>
      </div>
    )
  }

  const { basicInfo, statistics, metrics, other } = categorizeFields(organisation)

  const renderField = (field) => {
    const { key, value, label } = field
    const lowerKey = key.toLowerCase()

    // Special rendering for specific fields
    if (lowerKey === 'organisationtype') {
      return (
        <div key={key} className="org-detail-field">
          <span className="org-detail-label">{label}</span>
          <span className="org-detail-value">
            <SntBadge
              variant={getTypeBadgeVariant(value)}
              text={value || 'NORMAL'}
            />
          </span>
        </div>
      )
    }

    if (lowerKey.includes('online_ratio') || lowerKey.includes('onlineratio')) {
      return (
        <div key={key} className="org-detail-field">
          <span className="org-detail-label">{label}</span>
          <span className="org-detail-value">
            <SntProgressBar value={value} variant="auto" showLabel />
          </span>
        </div>
      )
    }

    if (lowerKey === 'locked') {
      return (
        <div key={key} className="org-detail-field">
          <span className="org-detail-label">{label}</span>
          <span className="org-detail-value">
            <SntBadge
              variant={value ? 'danger' : 'success'}
              text={value ? t('orgDetail.locked') : t('orgDetail.active')}
            />
          </span>
        </div>
      )
    }

    return (
      <div key={key} className="org-detail-field">
        <span className="org-detail-label">{label}</span>
        <span className="org-detail-value">{formatValue(value)}</span>
      </div>
    )
  }

  return (
    <div className="page-container">
      <SntPageHeader
        title={organisation.name}
        backTo="/"
      >
        <SntBadge
          variant={getTypeBadgeVariant(organisation.organisationType)}
          text={organisation.organisationType || 'NORMAL'}
        />
      </SntPageHeader>

      <SntCard title={`Trackers (${mapLoading ? '...' : devices.filter(d => d.lastLat != null).length})`}>
        {mapLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <SntSpinner size="medium" />
          </div>
        ) : (
          <SntDeviceMap
            mapboxKey={config.mapboxKey}
            locationiqKey={config.locationiqKey}
            height="500px"
            devices={devices}
            orgId={id}
            showGeozones={true}
            center={[50.85, 4.35]}
            zoom={6}
          />
        )}
      </SntCard>

      {basicInfo.length > 0 && (
        <SntCard title={t('orgDetail.basicInfo')}>
          <div className="org-detail-grid">
            {basicInfo.map(renderField)}
          </div>
        </SntCard>
      )}

      {metrics.length > 0 && (
        <SntCard title={t('orgDetail.metrics')} style={{ marginTop: 24 }}>
          <div className="org-detail-grid">
            {metrics.map(renderField)}
          </div>
        </SntCard>
      )}

      {statistics.length > 0 && (
        <SntCard title={t('orgDetail.statistics')} style={{ marginTop: 24 }}>
          <div className="org-detail-grid">
            {statistics.map(renderField)}
          </div>
        </SntCard>
      )}

      {other.length > 0 && (
        <SntCard title={t('orgDetail.otherDetails')} style={{ marginTop: 24 }}>
          <div className="org-detail-grid">
            {other.map(renderField)}
          </div>
        </SntCard>
      )}
    </div>
  )
}
