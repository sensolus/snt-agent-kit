export function SntSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`snt-switch ${disabled ? 'snt-switch--disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="snt-switch__slider" />
      {label && <span className="snt-switch__label">{label}</span>}
    </label>
  )
}
