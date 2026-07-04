/**
 * SntProgressBar - Small inline progress bar for percentages
 *
 * @param {number} value - Percentage value (0-100)
 * @param {string} variant - Color variant: 'primary', 'success', 'warning', 'danger', 'info'
 * @param {boolean} showLabel - Show percentage text (default: true)
 * @param {string} size - Size: 'small', 'medium' (default: 'small')
 * @param {string} className - Additional CSS classes
 */
export function SntProgressBar({
  value = 0,
  variant = 'primary',
  showLabel = true,
  size = 'small',
  className = '',
}) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value))

  // Auto-select variant based on value if not specified
  const autoVariant = variant === 'auto'
    ? (clampedValue >= 80 ? 'success' : clampedValue >= 50 ? 'warning' : 'danger')
    : variant

  return (
    <div className={`snt-progress-bar snt-progress-bar-${size} ${className}`.trim()}>
      <div className="snt-progress-track">
        <div
          className={`snt-progress-fill snt-progress-${autoVariant}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="snt-progress-label">{Math.round(clampedValue)}%</span>
      )}
    </div>
  )
}
