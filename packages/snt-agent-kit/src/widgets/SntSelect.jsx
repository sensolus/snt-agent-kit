/**
 * SntSelect - Dropdown select component
 *
 * @param {Array} options - Array of { value, label } objects
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler (receives value, not event)
 * @param {string} placeholder - Placeholder text when no value selected
 * @param {boolean} disabled - Disable select
 * @param {string} className - Additional CSS classes
 */
export function SntSelect({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      disabled={disabled}
      className={`snt-select ${className}`.trim()}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
