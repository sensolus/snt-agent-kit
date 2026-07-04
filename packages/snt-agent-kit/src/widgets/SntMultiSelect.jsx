import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from '../i18n'

/**
 * SntMultiSelect - Dropdown that lets the user pick several options at once.
 *
 * The trigger looks like SntSelect; clicking it opens a portaled popover with a
 * checkbox per option plus a "select all" toggle. onChange always receives the
 * full array of selected values.
 *
 * @param {Array} options - Array of { value, label } objects
 * @param {Array} value - Currently selected values
 * @param {function} onChange - Change handler (receives the new array of values)
 * @param {string} placeholder - Trigger text when nothing is selected
 * @param {boolean} disabled - Disable the control
 * @param {string} className - Additional CSS classes on the root
 */
export function SntMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder,
  disabled = false,
  className = '',
}) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 })

  // Position the popover under the trigger, tracking scroll/resize.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const updatePos = () => {
      const r = triggerRef.current.getBoundingClientRect()
      setPopoverPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open])

  // Close on outside click (trigger and portaled popover both count as "inside").
  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      const inTrigger = rootRef.current && rootRef.current.contains(e.target)
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target)
      if (!inTrigger && !inPopover) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const toggle = (optValue) => {
    if (value.includes(optValue)) {
      onChange?.(value.filter((v) => v !== optValue))
    } else {
      onChange?.([...value, optValue])
    }
  }

  const allSelected = options.length > 0 && value.length === options.length
  const someSelected = value.length > 0 && value.length < options.length
  const toggleAll = () => {
    onChange?.(allSelected ? [] : options.map((o) => o.value))
  }

  const triggerText = () => {
    if (value.length === 0) return placeholder ?? t('multiSelect.placeholder')
    if (value.length === 1) {
      const sel = options.find((o) => o.value === value[0])
      return sel ? sel.label : t('multiSelect.count', value.length)
    }
    return t('multiSelect.count', value.length)
  }

  return (
    <div className={`snt-multiselect ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`snt-multiselect-trigger${value.length === 0 ? ' snt-multiselect-placeholder' : ''}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {triggerText()}
      </button>

      {open && !disabled && createPortal(
        <div
          className="snt-multiselect-popover"
          role="listbox"
          aria-multiselectable="true"
          ref={popoverRef}
          style={{ top: popoverPos.top, left: popoverPos.left, minWidth: popoverPos.width }}
        >
          <label className="snt-multiselect-option snt-multiselect-all">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected
              }}
              onChange={toggleAll}
            />
            <span className="snt-multiselect-text">
              {allSelected ? t('checkboxList.deselectAll') : t('checkboxList.selectAll')}
            </span>
          </label>
          {options.map((opt) => (
            <label key={opt.value} className="snt-multiselect-option">
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              <span className="snt-multiselect-text">{opt.label}</span>
            </label>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
