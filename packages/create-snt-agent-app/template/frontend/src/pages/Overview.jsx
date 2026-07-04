import { useEffect, useState } from 'react'
import { SntCard, SntLoadingOverlay, SntSummaryStat, SntTable } from '@sensolus/snt-agent-kit'
import { useLocale, formatNumber, formatShortDate } from '../i18n'

const SERIES = [
  { key: 'orgCount', color: '#212851', labelKey: 'overview.series.orgs' },
  { key: 'trackerTotal', color: '#0071A1', labelKey: 'overview.series.trackers' },
  { key: 'userTotal', color: '#39CB99', labelKey: 'overview.series.users' },
]

const CHART_W = 720
const CHART_H = 280
const PADDING = { top: 16, right: 16, bottom: 32, left: 48 }

function LineChart({ data, intlLocale, timezone, t }) {
  if (!data.length) return null

  const innerW = CHART_W - PADDING.left - PADDING.right
  const innerH = CHART_H - PADDING.top - PADDING.bottom

  const maxValue = Math.max(
    1,
    ...data.flatMap((d) => SERIES.map((s) => d[s.key] || 0)),
  )

  const xFor = (i) =>
    PADDING.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const yFor = (v) => PADDING.top + innerH - (v / maxValue) * innerH

  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => Math.round((maxValue / ticks) * i))

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      style={{ width: '100%', height: 'auto', maxWidth: CHART_W }}
      role="img"
      aria-label={t('overview.chart.title')}
    >
      {/* y-axis grid + labels */}
      {yTicks.map((v, i) => {
        const y = yFor(v)
        return (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={CHART_W - PADDING.right}
              y1={y}
              y2={y}
              stroke="#E5E8ED"
              strokeWidth="1"
            />
            <text
              x={PADDING.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#535E6F"
            >
              {formatNumber(v, intlLocale)}
            </text>
          </g>
        )
      })}

      {/* x-axis labels (first, middle, last) */}
      {[0, Math.floor((data.length - 1) / 2), data.length - 1]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((i) => (
          <text
            key={i}
            x={xFor(i)}
            y={CHART_H - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#535E6F"
          >
            {formatShortDate(data[i].date, intlLocale, timezone)}
          </text>
        ))}

      {/* lines */}
      {SERIES.map((s) => {
        const path = data
          .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d[s.key] || 0)}`)
          .join(' ')
        return (
          <g key={s.key}>
            <path d={path} fill="none" stroke={s.color} strokeWidth="2" />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={xFor(i)}
                cy={yFor(d[s.key] || 0)}
                r="3"
                fill={s.color}
              >
                <title>
                  {formatShortDate(d.date, intlLocale, timezone)} — {t(s.labelKey)}:{' '}
                  {formatNumber(d[s.key] || 0, intlLocale)}
                </title>
              </circle>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function Overview({ authReady }) {
  const { t, intlLocale, timezone } = useLocale()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    setLoading(true)
    fetch('/api/org-stats/totals')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((rows) => {
        if (!cancelled) setData(rows)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [authReady])

  const latest = data[data.length - 1]

  return (
    <div className="page-container">
      {loading && <SntLoadingOverlay message={t('common.loading')} />}

      {!loading && error && (
        <SntCard>
          <p style={{ color: 'var(--snt-red)' }}>{error}</p>
        </SntCard>
      )}

      {!loading && !error && data.length === 0 && (
        <SntCard>
          <p>{t('overview.empty')}</p>
        </SntCard>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="summary-stats-row">
            <SntSummaryStat
              value={formatNumber(latest.orgCount, intlLocale)}
              label={t('overview.series.orgs')}
              variant="info"
            />
            <SntSummaryStat
              value={formatNumber(latest.trackerTotal, intlLocale)}
              label={t('overview.series.trackers')}
            />
            <SntSummaryStat
              value={formatNumber(latest.userTotal, intlLocale)}
              label={t('overview.series.users')}
              variant="success"
            />
          </div>

          <SntCard title={t('overview.chart.title')}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              {SERIES.map((s) => (
                <span
                  key={s.key}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 2,
                      background: s.color,
                    }}
                  />
                  {t(s.labelKey)}
                </span>
              ))}
            </div>
            <LineChart data={data} intlLocale={intlLocale} timezone={timezone} t={t} />
          </SntCard>

          <SntCard title={t('overview.table.title')}>
            <SntTable
              data={[...data].reverse()}
              rowKey="date"
              columns={[
                {
                  key: 'date',
                  header: t('overview.table.date'),
                  render: (row) => formatShortDate(row.date, intlLocale, timezone),
                },
                {
                  key: 'orgCount',
                  header: t('overview.series.orgs'),
                  render: (row) => formatNumber(row.orgCount, intlLocale),
                },
                {
                  key: 'trackerTotal',
                  header: t('overview.series.trackers'),
                  render: (row) => formatNumber(row.trackerTotal, intlLocale),
                },
                {
                  key: 'userTotal',
                  header: t('overview.series.users'),
                  render: (row) => formatNumber(row.userTotal, intlLocale),
                },
              ]}
            />
          </SntCard>
        </>
      )}
    </div>
  )
}
