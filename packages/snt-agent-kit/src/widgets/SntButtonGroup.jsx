/**
 * SntButtonGroup - Segmented control for exclusive selection
 *
 * @param {Array} options - Array of { value, label, icon? } objects. `icon` is an
 *   optional element (e.g. <SntIcon name="map" />) rendered before the label;
 *   pass a label of '' for an icon-only segment.
 * @param {string} value - Currently selected value
 * @param {function} onChange - Selection change handler (receives value)
 * @param {string} className - Additional CSS classes
 */
export function SntButtonGroup({
  options = [],
  value,
  onChange,
  className = '',
}) {
  return (
    <div className={`snt-button-group ${className}`.trim()}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`snt-btn ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange && onChange(option.value)}
        >
          {option.icon && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>{option.icon}</span>
          )}
          {option.label && <span>{option.label}</span>}
        </button>
      ))}
    </div>
  )
}
