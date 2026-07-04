import { useState, useEffect, useMemo, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SntButton,
  SntInput,
  SntBadge,
  SntButtonGroup,
  SntLoadingOverlay,
  SntTable,
  SntProgressBar,
  SntSidepanel,
  SntFilterSection,
  SntSwitch,
  SntCheckboxList,
  SntSummaryStat,
} from '@sensolus/snt-agent-kit'
import { useLocale, formatNumber } from '../i18n'
import { useFavourites } from '../hooks/useFavourites'

export function OrganisationList({ authReady, reloadRef, onLoadingChange }) {
  const navigate = useNavigate()
  const { t, intlLocale } = useLocale()
  const [organisations, setOrganisations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [viewMode, setViewMode] = useState('cards')
  const [sidepanelOpen, setSidepanelOpen] = useState(true)
  const [showOnlyActive, setShowOnlyActive] = useState(false)
  const [minSubscriptions, setMinSubscriptions] = useState(0)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false)
  const [filterPending, startFilterTransition] = useTransition()
  const { favourites, toggleFavourite, isFavourite } = useFavourites()

  const setShowOnlyFavouritesDeferred = (value) => {
    startFilterTransition(() => setShowOnlyFavourites(value))
  }

  const fetchOrganisations = async () => {
    if (!authReady) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/organisations')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('orgList.fetchFailed'))
      }

      setOrganisations(data)
      setLoaded(true)
    } catch (err) {
      setError(err.message)
      setOrganisations([])
    } finally {
      setLoading(false)
    }
  }

  // Auto-load once auth becomes available
  useEffect(() => {
    if (authReady && !loaded && !loading) {
      fetchOrganisations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady])

  // Expose reload to parent so the action button can live in the app header
  if (reloadRef) reloadRef.current = fetchOrganisations

  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

  // Get unique organisation types for the checkbox filter
  const organisationTypes = useMemo(() => {
    const types = new Set(organisations.map(org => org.organisationType || 'NORMAL'))
    return Array.from(types).sort()
  }, [organisations])

  // Filter organisations by all criteria, then sort favourites to top
  const filteredOrganisations = useMemo(() => {
    const filtered = organisations.filter(org => {
      // Favourites filter
      if (showOnlyFavourites && !isFavourite(org.id)) return false

      // Search filter
      if (searchFilter.trim()) {
        const search = searchFilter.toLowerCase()
        const matchesSearch =
          org.name?.toLowerCase().includes(search) ||
          org.id?.toString().includes(search) ||
          org.organisationType?.toLowerCase().includes(search)
        if (!matchesSearch) return false
      }

      // Active subscriptions filter
      if (showOnlyActive) {
        const activeSubs = org.statistics?.metrics?.NUMBER_OF_ACTIVE_SUBSCRIPTION ?? 0
        if (activeSubs === 0) return false
      }

      // Minimum subscriptions slider
      if (minSubscriptions > 0) {
        const subs = org.statistics?.metrics?.NUMBER_OF_ACTIVE_SUBSCRIPTION ?? 0
        if (subs < minSubscriptions) return false
      }

      // Organisation type filter
      if (selectedTypes.length > 0) {
        const orgType = org.organisationType || 'NORMAL'
        if (!selectedTypes.includes(orgType)) return false
      }

      return true
    })

    // Sort favourites to the top
    return filtered.sort((a, b) => {
      const aFav = isFavourite(a.id) ? 0 : 1
      const bFav = isFavourite(b.id) ? 0 : 1
      return aFav - bFav
    })
  }, [organisations, searchFilter, showOnlyActive, minSubscriptions, selectedTypes, showOnlyFavourites, isFavourite])

  // Compute summary statistics
  const summaryStats = useMemo(() => {
    const totalOrgs = organisations.length
    const totalTrackers = organisations.reduce((sum, org) =>
      sum + (org.statistics?.metrics?.NUMBER_OF_TRACKERS ?? 0), 0)
    const totalSubscriptions = organisations.reduce((sum, org) =>
      sum + (org.statistics?.metrics?.NUMBER_OF_ACTIVE_SUBSCRIPTION ?? 0), 0)
    const totalUsers = organisations.reduce((sum, org) =>
      sum + (org.statistics?.metrics?.NUMBER_OF_USERS ?? 0), 0)
    const avgOnlineRatio = organisations.length > 0
      ? organisations.reduce((sum, org) =>
          sum + (org.statistics?.metrics?.ONLINE_RATIO ?? 0), 0) / organisations.length
      : 0

    return { totalOrgs, totalTrackers, totalSubscriptions, totalUsers, avgOnlineRatio }
  }, [organisations])

  // Get max subscriptions for slider
  const maxSubscriptions = useMemo(() => {
    return Math.max(
      ...organisations.map(org => org.statistics?.metrics?.NUMBER_OF_ACTIVE_SUBSCRIPTION ?? 0),
      100
    )
  }, [organisations])

  const getTypeBadgeVariant = (type) => {
    switch (type?.toUpperCase()) {
      case 'PARTNER': return 'success'
      case 'SYSTEM': return 'warning'
      default: return 'info'
    }
  }

  // Helper to get metric from statistics.metrics
  const getMetric = (org, metricName) => {
    const value = org.statistics?.metrics?.[metricName]
    return value !== undefined ? Math.round(value) : null
  }

  const handleOrgClick = (org) => {
    // Store the org data in sessionStorage for the detail page
    sessionStorage.setItem(`org_${org.id}`, JSON.stringify(org))
    navigate(`/organisation/${org.id}`)
  }

  // Table columns definition - using actual API metric names
  const tableColumns = [
    {
      key: 'favourite',
      header: '',
      sortable: false,
      render: (row) => (
        <button
          className={`star-btn ${isFavourite(row.id) ? 'star-active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavourite(row.id) }}
          title={isFavourite(row.id) ? t('orgList.removeFavourite') : t('orgList.addFavourite')}
        >
          {isFavourite(row.id) ? '\u2605' : '\u2606'}
        </button>
      )
    },
    {
      key: 'name',
      header: t('orgList.col.name'),
      render: (row, value) => (
        <button
          className="link-button"
          onClick={() => handleOrgClick(row)}
        >
          {value}
        </button>
      )
    },
    { key: 'id', header: t('orgList.col.id') },
    {
      key: 'organisationType',
      header: t('orgList.col.type'),
      render: (row, value) => (
        <SntBadge variant={getTypeBadgeVariant(value)} text={value || 'NORMAL'} />
      )
    },
    {
      key: 'trackers',
      header: t('orgList.col.trackers'),
      getValue: (row) => row.statistics?.metrics?.NUMBER_OF_TRACKERS ?? null,
      render: (row) => getMetric(row, 'NUMBER_OF_TRACKERS') ?? '-'
    },
    {
      key: 'subscriptions',
      header: t('orgList.col.activeSubs'),
      getValue: (row) => row.statistics?.metrics?.NUMBER_OF_ACTIVE_SUBSCRIPTION ?? null,
      render: (row) => getMetric(row, 'NUMBER_OF_ACTIVE_SUBSCRIPTION') ?? '-'
    },
    {
      key: 'users',
      header: t('orgList.col.users'),
      getValue: (row) => row.statistics?.metrics?.NUMBER_OF_USERS ?? null,
      render: (row) => getMetric(row, 'NUMBER_OF_USERS') ?? '-'
    },
    {
      key: 'onlineRatio',
      header: t('orgList.col.online'),
      getValue: (row) => row.statistics?.metrics?.ONLINE_RATIO ?? null,
      render: (row) => {
        const ratio = row.statistics?.metrics?.ONLINE_RATIO
        return ratio !== undefined
          ? <SntProgressBar value={ratio} variant="auto" />
          : '-'
      }
    },
  ]

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchFilter('')
    setShowOnlyActive(false)
    setShowOnlyFavourites(false)
    setMinSubscriptions(0)
    setSelectedTypes([])
  }

  return (
    <div className="page-container">
      {/* Summary Stats */}
      {loaded && organisations.length > 0 && (
        <div className="summary-stats-row">
          <SntSummaryStat
            value={favourites.size}
            label={t('orgList.summary.favourites')}
            variant="warning"
            onClick={() => setShowOnlyFavouritesDeferred(!showOnlyFavourites)}
            active={showOnlyFavourites}
          />
          <SntSummaryStat
            value={summaryStats.totalOrgs}
            label={t('orgList.summary.organisations')}
            variant="info"
            onClick={() => setShowOnlyFavouritesDeferred(false)}
            active={!showOnlyFavourites}
          />
          <SntSummaryStat
            value={formatNumber(summaryStats.totalTrackers, intlLocale)}
            label={t('orgList.summary.totalTrackers')}
          />
          <SntSummaryStat
            value={formatNumber(summaryStats.totalSubscriptions, intlLocale)}
            label={t('orgList.summary.activeSubscriptions')}
            variant="success"
          />
          <SntSummaryStat
            value={formatNumber(summaryStats.totalUsers, intlLocale)}
            label={t('orgList.summary.totalUsers')}
          />
          <SntSummaryStat
            value={`${Math.round(summaryStats.avgOnlineRatio)}%`}
            label={t('orgList.summary.avgOnlineRatio')}
            variant={summaryStats.avgOnlineRatio >= 80 ? 'success' : summaryStats.avgOnlineRatio >= 50 ? 'warning' : 'danger'}
          />
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {loading && (
        <SntLoadingOverlay message={t('orgList.loadingOrgs')} />
      )}

      {/* Main content with sidepanel */}
      {loaded && organisations.length > 0 && (
        <div className="page-with-sidepanel">
          <SntSidepanel
            title={t('common.filters')}
            open={sidepanelOpen}
            onToggle={() => setSidepanelOpen(!sidepanelOpen)}
          >
            <SntFilterSection label={t('orgList.favourites')}>
              <SntSwitch
                checked={showOnlyFavourites}
                onChange={setShowOnlyFavourites}
                label={t('orgList.onlyFavourites')}
              />
            </SntFilterSection>

            <SntFilterSection label={t('common.search')}>
              <SntInput
                type="text"
                placeholder={t('orgList.searchPlaceholder')}
                value={searchFilter}
                onChange={setSearchFilter}
              />
            </SntFilterSection>

            <SntFilterSection label={t('orgList.activeSubscriptions')}>
              <SntSwitch
                checked={showOnlyActive}
                onChange={setShowOnlyActive}
                label={t('orgList.onlyActive')}
              />
            </SntFilterSection>

            <SntFilterSection label={t('orgList.minSubscriptions', minSubscriptions)}>
              <input
                type="range"
                className="snt-slider"
                min={0}
                max={maxSubscriptions}
                value={minSubscriptions}
                onChange={(e) => setMinSubscriptions(Number(e.target.value))}
              />
            </SntFilterSection>

            {organisationTypes.length > 0 && (
              <SntFilterSection label={t('orgList.organisationType')}>
                <SntCheckboxList
                  options={organisationTypes}
                  selected={selectedTypes}
                  onChange={setSelectedTypes}
                />
              </SntFilterSection>
            )}

            <SntFilterSection>
              <SntButton variant="secondary" onClick={handleResetFilters}>
                {t('common.resetFilters')}
              </SntButton>
            </SntFilterSection>
          </SntSidepanel>

          <div className={`page-main-content ${filterPending ? 'content-pending' : ''}`}>
            <div className="toolbar-row">
              <span className="filter-count">
                {t('orgList.showing', filteredOrganisations.length, organisations.length)}
              </span>
              <SntButtonGroup
                options={[
                  { value: 'cards', label: t('common.cards') },
                  { value: 'table', label: t('common.table') },
                ]}
                value={viewMode}
                onChange={setViewMode}
              />
            </div>

            {filteredOrganisations.length === 0 && (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3>{t('orgList.noOrgsFound')}</h3>
                <p>{t('orgList.noOrgsMatch')}</p>
              </div>
            )}

            {filteredOrganisations.length > 0 && viewMode === 'cards' && (
              <div className="org-grid">
                {filteredOrganisations.map((org) => (
                  <div
                    key={org.id}
                    className="org-card org-card-clickable"
                    onClick={() => handleOrgClick(org)}
                  >
                    <div className="org-card-header">
                      <h3 className="org-name">{org.name}</h3>
                      <button
                        className={`star-btn ${isFavourite(org.id) ? 'star-active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavourite(org.id) }}
                        title={isFavourite(org.id) ? t('orgList.removeFavourite') : t('orgList.addFavourite')}
                      >
                        {isFavourite(org.id) ? '\u2605' : '\u2606'}
                      </button>
                    </div>
                    <span className="org-type">
                      <SntBadge
                        variant={getTypeBadgeVariant(org.organisationType)}
                        text={org.organisationType || 'NORMAL'}
                      />
                    </span>
                    <div className="org-details">
                      <div className="org-stat">
                        <span className="stat-label">{t('orgList.stat.id')}</span>
                        <span className="stat-value">{org.id}</span>
                      </div>
                      {getMetric(org, 'NUMBER_OF_TRACKERS') !== null && (
                        <div className="org-stat">
                          <span className="stat-label">{t('orgList.stat.trackers')}</span>
                          <span className="stat-value">{getMetric(org, 'NUMBER_OF_TRACKERS')}</span>
                        </div>
                      )}
                      {getMetric(org, 'NUMBER_OF_ACTIVE_SUBSCRIPTION') !== null && (
                        <div className="org-stat">
                          <span className="stat-label">{t('orgList.stat.activeSubscriptions')}</span>
                          <span className="stat-value">{getMetric(org, 'NUMBER_OF_ACTIVE_SUBSCRIPTION')}</span>
                        </div>
                      )}
                      {getMetric(org, 'NUMBER_OF_USERS') !== null && (
                        <div className="org-stat">
                          <span className="stat-label">{t('orgList.stat.users')}</span>
                          <span className="stat-value">{getMetric(org, 'NUMBER_OF_USERS')}</span>
                        </div>
                      )}
                      {org.statistics?.metrics?.ONLINE_RATIO !== undefined && (
                        <div className="org-stat">
                          <span className="stat-label">{t('orgList.stat.online')}</span>
                          <span className="stat-value">
                            <SntProgressBar value={org.statistics.metrics.ONLINE_RATIO} variant="auto" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredOrganisations.length > 0 && viewMode === 'table' && (
              <SntTable
                data={filteredOrganisations}
                columns={tableColumns}
                defaultPageSize={25}
                emptyMessage={t('orgList.noOrgsFound')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
