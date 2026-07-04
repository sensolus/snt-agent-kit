/**
 * SntSummaryStat - Summary statistic display component
 *
 * @param {object} props
 * @param {string|number} props.value - The main value to display
 * @param {string} props.label - Text label below the value
 * @param {React.ReactNode} props.hint - Optional secondary description shown below the label
 * @param {string} props.variant - Optional badge variant (success, info, warning, danger, secondary)
 * @param {string} props.className - Additional CSS classes
 */
export function SntSummaryStat({ value, label, hint, variant, className = '', onClick, active }) {
  const variantClass = variant ? `summary-stat-${variant}` : ''
  const clickableClass = onClick ? 'summary-stat-clickable' : ''
  const activeClass = active ? 'summary-stat-active' : ''

  const handleKeyDown = onClick
    ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      }
    : undefined

  return (
    <div
      className={`summary-stat ${variantClass} ${clickableClass} ${activeClass} ${className}`.trim()}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="summary-value">{value}</span>
      <span className="summary-label">{label}</span>
      {hint && <span className="summary-hint">{hint}</span>}
    </div>
  )
}
