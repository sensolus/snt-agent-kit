import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SntBadge,
  SntButton,
  SntCard,
  SntDeviceLayer,
  SntFilterSection,
  SntInput,
  SntLoadingOverlay,
  SntMap,
  SntMessage,
  SntSidepanel,
  SntSwitch,
} from '@sensolus/snt-agent-kit'
import { useLocale, formatDateTime } from '../i18n'
import { useAppConfig } from '../AppConfigContext'
import { useFavourites } from '../hooks/useFavourites'

// Only what this page shows: a smaller response, and a list of what there is to ask for.
const FIELDS = 'serial,name,status,productName,lastSeenAlive,lastLat,lastLng,lastAddress,lastLocationUpdate'
const MAX_RESULTS = 200
const SEARCH_DELAY_MS = 400

/**
 * Device browser: search this organisation's devices on the left, and see the one
 * picked on the right, with its last position on the map. The shape of a
 * customer-specific asset page: a search, a list, a detail, one organisation.
 *
 * The search runs on the Sensolus API: POST /api/devices/byFilter with an
 * IDENTIFIER filter, which matches serials and names, and an empty value, which
 * matches every device. Favourites are this app's own data, kept per user in its
 * database (/api/favourites).
 */
export function DeviceBrowser({ authReady, reloadRef, onLoadingChange }) {
  const { t, intlLocale, timezone } = useLocale()
  const config = useAppConfig()
  const { toggleFavourite, isFavourite } = useFavourites()
  const [devices, setDevices] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [onlyFavourites, setOnlyFavourites] = useState(false)
  const [sidepanelOpen, setSidepanelOpen] = useState(true)
  const [selectedSerial, setSelectedSerial] = useState(null)

  const fetchDevices = useCallback(async (text) => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`/api/devices/byFilter?fields=${encodeURIComponent(FIELDS)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxResults: MAX_RESULTS,
          startIndex: 0,
          filter: {
            field: 'IDENTIFIER',
            value: text,
            type: 'STRING',
            includedNull: false,
            includedNotNull: false,
          },
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || data.message || 'fetchFailed')
      setDevices(data.data || [])
      setTotal(data.count ?? (data.data || []).length)
      setLoaded(true)
    } catch (err) {
      setError(err.message)
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Search as the user types, once they pause.
  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(search.trim()), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (authReady) fetchDevices(appliedSearch)
  }, [authReady, appliedSearch, fetchDevices])

  // Expose reload to parent so the action button can live in the app header
  if (reloadRef) reloadRef.current = () => fetchDevices(appliedSearch)

  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

  // Favourites first, then as the API returned them.
  const shown = useMemo(() => {
    const list = onlyFavourites ? devices.filter((d) => isFavourite(d.serial)) : devices
    return [...list].sort((a, b) => (isFavourite(a.serial) ? 0 : 1) - (isFavourite(b.serial) ? 0 : 1))
  }, [devices, onlyFavourites, isFavourite])

  const selected = devices.find((d) => d.serial === selectedSerial) || null
  const hasPosition = selected && selected.lastLat != null && selected.lastLng != null

  const star = (device) => (
    <button
      className={`star-btn ${isFavourite(device.serial) ? 'star-active' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        toggleFavourite(device.serial)
      }}
      title={isFavourite(device.serial) ? t('devices.removeFavourite') : t('devices.addFavourite')}
    >
      {isFavourite(device.serial) ? '★' : '☆'}
    </button>
  )

  const detailRows = selected
    ? [
        ['devices.serial', selected.serial],
        ['devices.product', selected.productName],
        ['devices.status', selected.status],
        ['devices.lastSeen', formatDateTime(selected.lastSeenAlive, intlLocale, timezone)],
        ['devices.lastPosition', formatDateTime(selected.lastLocationUpdate, intlLocale, timezone)],
        ['devices.lastAddress', selected.lastAddress],
      ]
    : []

  return (
    <div className="page-container">
      {error && (
        <div className="error">{error === 'fetchFailed' ? t('devices.fetchFailed') : error}</div>
      )}

      <div className="page-with-sidepanel">
        <SntSidepanel
          title={t('common.filters')}
          open={sidepanelOpen}
          onToggle={() => setSidepanelOpen(!sidepanelOpen)}
        >
          <SntFilterSection label={t('common.search')}>
            <SntInput
              type="text"
              placeholder={t('devices.searchPlaceholder')}
              value={search}
              onChange={setSearch}
            />
          </SntFilterSection>

          <SntFilterSection label={t('devices.favourites')}>
            <SntSwitch
              checked={onlyFavourites}
              onChange={setOnlyFavourites}
              label={t('devices.onlyFavourites')}
            />
          </SntFilterSection>

          <SntFilterSection>
            <SntButton
              variant="secondary"
              onClick={() => {
                setSearch('')
                setOnlyFavourites(false)
              }}
            >
              {t('common.resetFilters')}
            </SntButton>
          </SntFilterSection>
        </SntSidepanel>

        <div className="page-main-content">
          {loading && <SntLoadingOverlay message={t('devices.loading')} />}

          <div className="toolbar-row">
            <span className="filter-count">{t('devices.showing', shown.length, total)}</span>
          </div>

          {loaded && shown.length === 0 && (
            <div className="empty-state">
              <h3>{t('devices.noneFound')}</h3>
              <p>{t('devices.noneMatch')}</p>
            </div>
          )}

          {shown.length > 0 && (
            <div className="device-browser">
              <div className="device-list">
                {shown.map((device) => (
                  <div
                    key={device.serial}
                    className={`item-card item-card-clickable ${
                      device.serial === selectedSerial ? 'item-card-selected' : ''
                    }`}
                    onClick={() => setSelectedSerial(device.serial)}
                  >
                    <div className="item-card-header">
                      <h3 className="item-name">{device.name || device.serial}</h3>
                      {star(device)}
                    </div>
                    <div className="item-details">
                      <div className="item-stat">
                        <span className="stat-label">{t('devices.serial')}</span>
                        <span className="stat-value">{device.serial}</span>
                      </div>
                      {device.status && (
                        <div className="item-stat">
                          <span className="stat-label">{t('devices.status')}</span>
                          <SntBadge
                            variant={device.status === 'ACTIVE' ? 'success' : 'secondary'}
                            text={device.status}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="device-detail">
                {selected ? (
                  <SntCard title={selected.name || selected.serial} titleButton={star(selected)}>
                    <div className="item-details">
                      {detailRows.map(([key, value]) => (
                        <div className="item-stat" key={key}>
                          <span className="stat-label">{t(key)}</span>
                          <span className="stat-value">{value || '-'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="device-map">
                      {hasPosition ? (
                        // Keyed by device, so picking another one recentres the map.
                        <SntMap
                          key={selected.serial}
                          mapboxKey={config.mapboxKey}
                          locationiqKey={config.locationiqKey}
                          height="320px"
                          center={[selected.lastLat, selected.lastLng]}
                          zoom={13}
                        >
                          <SntDeviceLayer
                            devices={[
                              {
                                id: selected.serial,
                                name: selected.name || selected.serial,
                                lastLat: selected.lastLat,
                                lastLng: selected.lastLng,
                              },
                            ]}
                          />
                        </SntMap>
                      ) : (
                        <SntMessage>{t('devices.noPosition')}</SntMessage>
                      )}
                    </div>
                  </SntCard>
                ) : (
                  <SntMessage variant="info">{t('devices.pickOne')}</SntMessage>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
