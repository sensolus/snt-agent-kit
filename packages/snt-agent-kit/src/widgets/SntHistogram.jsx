/**
 * Allowed brand colors histogram bars cycle through, in order. Drawn from the
 * Sensolus palette (theme CSS vars, so they follow the active theme).
 */
export const SNT_HISTOGRAM_COLORS = [
  'var(--snt-blue)',
  'var(--snt-green)',
  'var(--snt-orange)',
  'var(--snt-purple)',
  'var(--snt-ui-selected)',
  'var(--snt-yellow)',
  'var(--snt-salmon)',
  'var(--snt-emerald)',
]

/**
 * SntHistogram - Microchart histogram for showing data distribution
 *
 * @param {object} props
 * @param {Array} props.buckets - Array of {start, end, count} bucket objects
 * @param {number} props.height - Chart height in pixels (default: 60)
 * @param {function} props.formatValue - Optional formatter for axis labels
 * @param {string[]} props.colors - Bar colors to cycle through (default: SNT_HISTOGRAM_COLORS)
 */
export function SntHistogram({
  buckets = [],
  height = 60,
  formatValue,
  colors = SNT_HISTOGRAM_COLORS,
}) {
  if (!buckets.length) return null

  const maxCount = Math.max(...buckets.map((b) => b.count), 1)
  const minValue = buckets[0]?.start ?? 0
  const maxValue = buckets[buckets.length - 1]?.end ?? 0

  // Default formatter - shorten large numbers
  const defaultFormat = (v) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
    return v.toLocaleString()
  }

  const format = formatValue || defaultFormat

  return (
    <div className="snt-histogram" style={{ '--histogram-height': `${height}px` }}>
      <div className="snt-histogram-chart">
        <div className="snt-histogram-bars">
          {buckets.map((bucket, index) => {
            const barHeight = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0

            return (
              <div
                key={index}
                className="snt-histogram-bar"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: colors.length
                    ? colors[index % colors.length]
                    : undefined,
                }}
                title={`${bucket.start.toLocaleString()} - ${bucket.end.toLocaleString()}: ${bucket.count.toLocaleString()}`}
              />
            )
          })}
        </div>
      </div>
      <div className="snt-histogram-axis">
        <span>{format(minValue)}</span>
        <span>{format(maxValue)}</span>
      </div>
    </div>
  )
}
