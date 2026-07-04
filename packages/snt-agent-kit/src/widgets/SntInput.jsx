/**
 * SntInput - Text input component
 *
 * @param {string} type - Input type: 'text', 'password', 'email', 'number', etc.
 * @param {string} value - Input value
 * @param {function} onChange - Change handler (receives value, not event)
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disable input
 * @param {boolean} readOnly - Read-only input
 * @param {string} className - Additional CSS classes
 * @param {function} onKeyPress - Key press handler (receives event)
 */
export function SntInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  className = '',
  onKeyPress,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value, e)}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={`snt-input ${className}`.trim()}
    />
  )
}
