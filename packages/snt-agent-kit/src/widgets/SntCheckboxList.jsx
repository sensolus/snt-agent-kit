/**
 * SntCheckboxList - Multi-select checkbox list for filtering
 *
 * @param {string[]} options - Selectable values
 * @param {string[]} selected - Currently selected values
 * @param {function} onChange - Receives the new array of selected values
 * @param {string} label - Optional group label above the list
 * @param {function} formatLabel - Optional formatter for each option's display text
 * @param {'vertical'|'horizontal'} layout - Stacked column (default) or a wrapping inline row
 */
import { useLocale } from '../i18n'

export function SntCheckboxList({ options, selected, onChange, label, formatLabel, layout = 'vertical' }) {
  const { t } = useLocale()
  const handleToggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange([...options])
    }
  }

  const allSelected = selected.length === options.length
  const someSelected = selected.length > 0 && selected.length < options.length

  return (
    <div className={`snt-checkbox-list snt-checkbox-list--${layout}`}>
      {label && <div className="snt-checkbox-list-label">{label}</div>}
      <div className="snt-checkbox-list-items">
        <label className="snt-checkbox-item snt-checkbox-all">
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => {
              if (el) el.indeterminate = someSelected
            }}
            onChange={handleSelectAll}
          />
          <span className="snt-checkbox-text">
            {allSelected ? t('checkboxList.deselectAll') : t('checkboxList.selectAll')}
          </span>
        </label>
        {options.map(option => (
          <label key={option} className="snt-checkbox-item">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => handleToggle(option)}
            />
            <span className="snt-checkbox-text">{formatLabel ? formatLabel(option) : option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
