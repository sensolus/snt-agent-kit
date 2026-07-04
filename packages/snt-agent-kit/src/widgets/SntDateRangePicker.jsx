import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, formatShortDate } from '../i18n'

const MS_DAY = 86400000

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}
function startOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  x.setHours(23, 59, 59, 999)
  return x
}
function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
function addMonths(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth() + n, d.getDate())
  x.setHours(0, 0, 0, 0)
  return x
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
function clampDate(d, min, max) {
  if (min && d < min) return new Date(min)
  if (max && d > max) return new Date(max)
  return d
}

/** Convert "MONDAY"/"SUNDAY" → 0..6 where 0 = Sunday (JS default). */
function weekStartIndex(weekStart) {
  return weekStart === 'SUNDAY' ? 0 : 1
}

/** Start of week containing d, given week start index (0..6, Sun=0). */
function startOfWeek(d, weekStartIdx) {
  const x = startOfDay(d)
  const diff = (x.getDay() - weekStartIdx + 7) % 7
  return addDays(x, -diff)
}

/**
 * Snap a value (date or {start,end}) to the canonical range for the given mode.
 * Returns { start: Date, end: Date }.
 */
function snapToMode(mode, ref, weekStartIdx) {
  if (mode === 'day') {
    const s = startOfDay(ref.start)
    return { start: s, end: endOfDay(s) }
  }
  if (mode === 'week') {
    const s = startOfWeek(ref.start, weekStartIdx)
    return { start: s, end: endOfDay(addDays(s, 6)) }
  }
  if (mode === 'month') {
    return { start: startOfMonth(ref.start), end: endOfMonth(ref.start) }
  }
  // custom: pass through
  return {
    start: startOfDay(ref.start),
    end: endOfDay(ref.end || ref.start),
  }
}

function shiftRange(mode, value, dir) {
  const d = dir // -1 or +1
  if (mode === 'day') return { start: addDays(value.start, d), end: addDays(value.start, d) }
  if (mode === 'week') {
    const s = addDays(value.start, 7 * d)
    return { start: s, end: addDays(s, 6) }
  }
  if (mode === 'month') {
    const s = startOfMonth(addMonths(value.start, d))
    return { start: s, end: endOfMonth(s) }
  }
  // custom: shift by the existing duration in days (min 1)
  const days = Math.max(1, Math.round((value.end - value.start) / MS_DAY) + 1)
  return { start: addDays(value.start, days * d), end: addDays(value.end, days * d) }
}

/** Returns the 6×7 grid of dates for the month panel containing `viewDate`. */
function buildMonthGrid(viewDate, weekStartIdx) {
  const first = startOfMonth(viewDate)
  const gridStart = startOfWeek(first, weekStartIdx)
  const cells = []
  for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i))
  return cells
}

function getWeekdayLabels(intlLocale, weekStartIdx) {
  const fmt = new Intl.DateTimeFormat(intlLocale, { weekday: 'short' })
  // Use a known week containing 2023-01-01 (Sunday) so we can map by getDay()
  const base = new Date(2023, 0, 1) // Sunday
  const labels = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(base, (weekStartIdx + i) % 7)
    const lbl = fmt.format(d)
    // Trim trailing dot and limit to 2 chars (Mo, Tu, We, ...)
    labels.push(lbl.replace(/\.$/, '').slice(0, 2))
  }
  return labels
}

function formatMonthYear(d, intlLocale) {
  return new Intl.DateTimeFormat(intlLocale, { month: 'long', year: 'numeric' }).format(d)
}
function formatMonthShort(d, intlLocale) {
  return new Intl.DateTimeFormat(intlLocale, { month: 'short' }).format(d)
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M10 4l-4 4 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M6 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const BUILT_IN_MODES = ['day', 'week', 'month', 'custom']
const DEFAULT_MODES = BUILT_IN_MODES

function isBuiltInMode(k) { return BUILT_IN_MODES.includes(k) }
function isPresetKey(k, customPresets = null) {
  return DATE_RANGE_PRESETS.includes(k) || !!(customPresets && customPresets[k])
}

function choiceLabel(t, k, customPresets = null) {
  if (isBuiltInMode(k)) return t(`dateRange.mode.${k}`)
  if (customPresets && customPresets[k]) return customPresets[k].label ?? k
  return t(`dateRange.preset.${k}`)
}

/**
 * Catalog of supported relative-period preset keys. These can be mixed into
 * the `modes` prop alongside the built-in 'day'|'week'|'month'|'custom'.
 */
export const DATE_RANGE_PRESETS = [
  'last_48h',
  'last_7d',
  'last_14d',
  'last_30d',
  'last_60d',
  'last_90d',
  'last_180d',
  'last_365d',
  'today',
  'yesterday',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
  // Finance / period presets (rolling, anchored to "now")
  'last_3_months',
  'last_6_months',
  'last_12_months',
  'last_24_months',
  'last_36_months',
  'this_quarter',
  'previous_quarter',
  'this_year',
  'last_year',
  'all_time',
  // Future-inclusive presets
  'next_3_months',
  'next_6_months',
  'next_12_months',
  'next_quarter',
  'rolling_12_months',
]

/**
 * Compute the { start, end } JS Dates for a preset key, anchored to `now`.
 * Returns null for unknown keys. Named-period presets ("today", "this_week", ...)
 * honour the supplied `weekStart` ('MONDAY' | 'SUNDAY').
 */
export function getPresetRange(key, now = new Date(), weekStart = 'MONDAY', customPresets = null) {
  const weekStartIdx = weekStartIndex(weekStart)
  // Consumer-defined presets take precedence over the built-in catalog.
  if (customPresets && customPresets[key] && typeof customPresets[key].getRange === 'function') {
    const r = customPresets[key].getRange(now)
    return r ? { start: new Date(r.start), end: new Date(r.end) } : null
  }
  if (key === 'last_48h') return { start: new Date(now.getTime() - 48 * 3600 * 1000), end: new Date(now) }
  if (key === 'last_7d') return { start: new Date(now.getTime() - 7 * MS_DAY), end: new Date(now) }
  if (key === 'last_14d') return { start: new Date(now.getTime() - 14 * MS_DAY), end: new Date(now) }
  if (key === 'last_30d') return { start: new Date(now.getTime() - 30 * MS_DAY), end: new Date(now) }
  if (key === 'last_60d') return { start: new Date(now.getTime() - 60 * MS_DAY), end: new Date(now) }
  if (key === 'last_90d') return { start: new Date(now.getTime() - 90 * MS_DAY), end: new Date(now) }
  if (key === 'last_180d') return { start: new Date(now.getTime() - 180 * MS_DAY), end: new Date(now) }
  if (key === 'last_365d') return { start: new Date(now.getTime() - 365 * MS_DAY), end: new Date(now) }
  if (key === 'today') return { start: startOfDay(now), end: endOfDay(now) }
  if (key === 'yesterday') {
    const y = addDays(now, -1)
    return { start: startOfDay(y), end: endOfDay(y) }
  }
  if (key === 'this_week') {
    const s = startOfWeek(now, weekStartIdx)
    return { start: s, end: endOfDay(addDays(s, 6)) }
  }
  if (key === 'last_week') {
    const s = addDays(startOfWeek(now, weekStartIdx), -7)
    return { start: s, end: endOfDay(addDays(s, 6)) }
  }
  if (key === 'this_month') return { start: startOfMonth(now), end: endOfMonth(now) }
  if (key === 'last_month') {
    const ref = addMonths(now, -1)
    return { start: startOfMonth(ref), end: endOfMonth(ref) }
  }
  // --- Finance / period presets ---
  // Rolling "last N months": N months back from today through today.
  if (key === 'last_3_months') return { start: startOfDay(addMonths(now, -3)), end: endOfDay(now) }
  if (key === 'last_6_months') return { start: startOfDay(addMonths(now, -6)), end: endOfDay(now) }
  if (key === 'last_12_months') return { start: startOfDay(addMonths(now, -12)), end: endOfDay(now) }
  if (key === 'last_24_months') return { start: startOfDay(addMonths(now, -24)), end: endOfDay(now) }
  if (key === 'last_36_months') return { start: startOfDay(addMonths(now, -36)), end: endOfDay(now) }
  if (key === 'this_year') return { start: startOfDay(new Date(now.getFullYear(), 0, 1)), end: endOfDay(now) }
  if (key === 'last_year') {
    return {
      start: startOfDay(new Date(now.getFullYear() - 1, 0, 1)),
      end: endOfDay(new Date(now.getFullYear() - 1, 11, 31)),
    }
  }
  if (key === 'all_time') return { start: startOfDay(new Date(2015, 0, 1)), end: endOfDay(now) }
  if (key === 'this_quarter') {
    const q = Math.floor(now.getMonth() / 3)
    return {
      start: startOfDay(new Date(now.getFullYear(), q * 3, 1)),
      end: endOfDay(new Date(now.getFullYear(), q * 3 + 3, 0)),
    }
  }
  if (key === 'previous_quarter') {
    const q = Math.floor(now.getMonth() / 3)
    return {
      start: startOfDay(new Date(now.getFullYear(), (q - 1) * 3, 1)),
      end: endOfDay(new Date(now.getFullYear(), q * 3, 0)),
    }
  }
  if (key === 'next_quarter') {
    const q = Math.floor(now.getMonth() / 3)
    return {
      start: startOfDay(new Date(now.getFullYear(), (q + 1) * 3, 1)),
      end: endOfDay(new Date(now.getFullYear(), (q + 2) * 3, 0)),
    }
  }
  // Future-inclusive: today through N months forward.
  if (key === 'next_3_months') return { start: startOfDay(now), end: endOfDay(addMonths(now, 3)) }
  if (key === 'next_6_months') return { start: startOfDay(now), end: endOfDay(addMonths(now, 6)) }
  if (key === 'next_12_months') return { start: startOfDay(now), end: endOfDay(addMonths(now, 12)) }
  // Centered rolling window: 6 months back through 6 months forward.
  if (key === 'rolling_12_months') return { start: startOfDay(addMonths(now, -6)), end: endOfDay(addMonths(now, 6)) }
  return null
}

/** Match current value to a preset key within ±5 min tolerance. Null if none match. */
function detectActivePreset(value, presetKeys, weekStartIdx, customPresets = null) {
  if (!value?.start || !value?.end) return null
  const weekStart = weekStartIdx === 0 ? 'SUNDAY' : 'MONDAY'
  const now = new Date()
  const tol = 5 * 60 * 1000
  const vs = value.start.getTime()
  const ve = value.end.getTime()
  for (const k of presetKeys) {
    const r = getPresetRange(k, now, weekStart, customPresets)
    if (!r) continue
    if (Math.abs(r.start.getTime() - vs) < tol && Math.abs(r.end.getTime() - ve) < tol) return k
  }
  return null
}

function displayText(value, intlLocale, timezone) {
  if (!value?.start) return ''
  const s = value.start
  const e = value.end || value.start
  if (value.viewMode === 'day') {
    return formatShortDate(s, intlLocale, timezone)
  }
  if (value.viewMode === 'month') {
    return new Intl.DateTimeFormat(intlLocale, {
      month: 'short',
      year: 'numeric',
      timeZone: timezone,
    }).format(s)
  }
  // week | custom
  return `${formatShortDate(s, intlLocale, timezone)} - ${formatShortDate(e, intlLocale, timezone)}`
}

/**
 * SntDateRangePicker - Sensolus-style date range picker.
 *
 * Props
 *  - value: { viewMode: 'day'|'week'|'month'|'custom', start: Date, end: Date }
 *  - onChange: (value) => void
 *  - modes: which choice buttons to render in the segmented group, in input order.
 *           Default is ['day', 'week', 'month', 'custom']. Each entry can be a
 *           built-in mode ('day'|'week'|'month'|'custom'), any relative-period
 *           key from DATE_RANGE_PRESETS (e.g. 'last_7d', 'last_30d', 'this_month',
 *           'last_12_months', 'this_quarter', 'rolling_12_months'), or a key from
 *           `customPresets`. 'custom' is auto-sorted to the end if present. Pass []
 *           to hide the group.
 *  - customPresets: consumer-defined presets not in the built-in catalog, as a map
 *           { key: { label: string, getRange: (now: Date) => { start: Date, end: Date } } }.
 *           Reference the key in `modes` to render it. Selecting a preset (built-in
 *           or custom) emits a { viewMode: 'custom', start, end } range and is NOT
 *           clamped to minDate/maxDate, so future-inclusive presets resolve in full.
 *  - minDate, maxDate: optional JS Dates clamping navigation and manual selection
 *  - weekStart: 'MONDAY' | 'SUNDAY' — overrides the locale's first-day-of-week
 *  - disabled: disables prev/next arrows and opening the calendar
 *  - hideNav: hide the < [date] > navigation block entirely
 *  - navigable: when false, the period is shown as a static, slightly bolder
 *           label — no < > arrows and no calendar popover. The mode buttons
 *           still drive the range. Ignored when hideNav is true.
 *  - direction: 'horizontal' (default) lays the nav and mode buttons out in a
 *           row; 'vertical' stacks the nav above the mode group and lets the
 *           mode buttons wrap as standalone chips — suited to a column of
 *           filters in a sidebar.
 */
export function SntDateRangePicker({
  value,
  onChange,
  modes = DEFAULT_MODES,
  customPresets = null,
  minDate,
  maxDate = endOfDay(new Date()),
  weekStart,
  disabled = false,
  hideNav = false,
  navigable = true,
  direction = 'horizontal',
}) {
  const { t, intlLocale, timezone, firstDayOfWeek } = useLocale()
  const weekStartIdx = weekStartIndex(weekStart || firstDayOfWeek)
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => value?.start || new Date())
  const [hoverDate, setHoverDate] = useState(null)
  const [rangeAnchor, setRangeAnchor] = useState(null) // for custom 2-click selection
  const rootRef = useRef(null)
  const displayRef = useRef(null)
  const popoverRef = useRef(null)
  const modesRef = useRef(null)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })

  // Keep the visible month synced with the selected start
  useEffect(() => {
    if (value?.start) setViewDate(value.start)
  }, [value?.start])

  // Position the popover under the date display, accounting for viewport scroll.
  useLayoutEffect(() => {
    if (!open) return
    // Anchor the popover to the nav display when present, otherwise to the
    // mode/preset button group (e.g. navigable={false}, where the display
    // button isn't rendered but Custom still needs to open the calendar).
    const anchorEl = displayRef.current || modesRef.current
    if (!anchorEl) return
    const updatePos = () => {
      const r = anchorEl.getBoundingClientRect()
      setPopoverPos({
        top: r.bottom + 8,
        left: r.left,
      })
    }
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open])

  // Close popup on outside click (consider both the trigger and the portaled popover)
  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      const inTrigger = rootRef.current && rootRef.current.contains(e.target)
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target)
      if (!inTrigger && !inPopover) {
        setOpen(false)
        setRangeAnchor(null)
        setHoverDate(null)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  if (!value) return null

  const emit = (next, { clamp = true } = {}) => {
    const start = clamp ? clampDate(next.start, minDate, maxDate) : next.start
    const end = clamp ? clampDate(next.end, minDate, maxDate) : next.end
    onChange?.({
      viewMode: next.viewMode ?? value.viewMode,
      start,
      end,
    })
  }

  const onPrev = () => {
    if (disabled) return
    const next = shiftRange(value.viewMode, value, -1)
    emit(next)
  }
  const onNext = () => {
    if (disabled) return
    const next = shiftRange(value.viewMode, value, +1)
    emit(next)
  }

  const handleDayClick = (date) => {
    if (value.viewMode === 'day') {
      emit({ viewMode: 'day', start: startOfDay(date), end: endOfDay(date) })
      setOpen(false)
      return
    }
    if (value.viewMode === 'week') {
      const s = startOfWeek(date, weekStartIdx)
      emit({ viewMode: 'week', start: s, end: endOfDay(addDays(s, 6)) })
      setOpen(false)
      return
    }
    if (value.viewMode === 'custom') {
      if (!rangeAnchor) {
        setRangeAnchor(date)
        return
      }
      const a = rangeAnchor < date ? rangeAnchor : date
      const b = rangeAnchor < date ? date : rangeAnchor
      emit({ viewMode: 'custom', start: startOfDay(a), end: endOfDay(b) })
      setRangeAnchor(null)
      setHoverDate(null)
      setOpen(false)
    }
  }

  const handleMonthClick = (monthIdx) => {
    if (value.viewMode !== 'month') return
    const s = new Date(viewDate.getFullYear(), monthIdx, 1)
    s.setHours(0, 0, 0, 0)
    emit({ viewMode: 'month', start: s, end: endOfMonth(s) })
    setOpen(false)
  }

  const goToToday = () => {
    const today = new Date()
    setViewDate(today)
    // "Today" is a single-day preset — if Day mode is available, snap to it;
    // otherwise keep the current mode and snap its range around today.
    const targetMode = modes.includes('day') ? 'day' : value.viewMode
    const snapped = snapToMode(targetMode, { start: today, end: today }, weekStartIdx)
    emit({ ...snapped, viewMode: targetMode })
    setOpen(false)
  }

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(intlLocale, weekStartIdx),
    [intlLocale, weekStartIdx],
  )

  // Determine selection range for highlighting
  const selStart = value.start ? startOfDay(value.start) : null
  const selEnd = value.end ? startOfDay(value.end) : selStart
  const previewStart =
    rangeAnchor && hoverDate
      ? (rangeAnchor < hoverDate ? startOfDay(rangeAnchor) : startOfDay(hoverDate))
      : null
  const previewEnd =
    rangeAnchor && hoverDate
      ? (rangeAnchor < hoverDate ? startOfDay(hoverDate) : startOfDay(rangeAnchor))
      : null

  const validChoices = modes.filter((k) => isBuiltInMode(k) || isPresetKey(k, customPresets))
  const choices = [
    ...validChoices.filter((k) => k !== 'custom'),
    ...(validChoices.includes('custom') ? ['custom'] : []),
  ]
  const presetKeysInGroup = choices.filter((k) => isPresetKey(k, customPresets))
  const activePreset = presetKeysInGroup.length > 0
    ? detectActivePreset(value, presetKeysInGroup, weekStartIdx, customPresets)
    : null
  const showCalendarMode = value.viewMode !== 'month'

  const onChoiceClick = (key) => {
    if (disabled) return
    if (isPresetKey(key, customPresets)) {
      const r = getPresetRange(key, new Date(), weekStartIdx === 0 ? 'SUNDAY' : 'MONDAY', customPresets)
      if (!r) return
      // Presets are deliberate selections — don't clamp them to maxDate, so
      // future-inclusive presets (next_*, rolling_12_months) resolve in full.
      emit({ viewMode: 'custom', start: r.start, end: r.end }, { clamp: false })
      setOpen(false)
      setRangeAnchor(null)
      setHoverDate(null)
      return
    }
    if (key === 'custom') {
      // Custom always opens the calendar so a range can be picked — even when
      // it's already the active view mode, and even when the nav display
      // (the usual way to open the calendar) is hidden via navigable={false}.
      if (value.viewMode !== 'custom') {
        const snapped = snapToMode('custom', value, weekStartIdx)
        emit({ ...snapped, viewMode: 'custom' })
      }
      setRangeAnchor(null)
      setHoverDate(null)
      setOpen(true)
      return
    }
    if (key === value.viewMode) return
    const snapped = snapToMode(key, value, weekStartIdx)
    emit({ ...snapped, viewMode: key })
  }

  const isChoiceActive = (key) => {
    if (activePreset) return key === activePreset
    return isBuiltInMode(key) && key === value.viewMode
  }

  return (
    <div
      className={`snt-drp${direction === 'vertical' ? ' snt-drp-vertical' : ''}${disabled ? ' snt-drp-disabled' : ''}`}
      ref={rootRef}
    >
      {!hideNav && !navigable && (
        <div className="snt-drp-label">
          {displayText(value, intlLocale, timezone)}
        </div>
      )}

      {!hideNav && navigable && (
        <div className={`snt-drp-nav${open ? ' open' : ''}`}>
          <button
            type="button"
            className="snt-drp-arrow"
            onClick={onPrev}
            disabled={disabled}
            aria-label={t('dateRange.prev')}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            ref={displayRef}
            className="snt-drp-display"
            onClick={() => !disabled && setOpen((o) => !o)}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            {displayText(value, intlLocale, timezone)}
          </button>
          <button
            type="button"
            className="snt-drp-arrow"
            onClick={onNext}
            disabled={disabled}
            aria-label={t('dateRange.next')}
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {choices.length > 0 && (
        <div className="snt-drp-modes" role="group" aria-label={t('dateRange.mode.group')} ref={modesRef}>
          {choices.map((k) => (
            <button
              key={k}
              type="button"
              className={`snt-drp-mode${isChoiceActive(k) ? ' active' : ''}`}
              onClick={() => onChoiceClick(k)}
              disabled={disabled}
            >
              {choiceLabel(t, k, customPresets)}
            </button>
          ))}
        </div>
      )}

      {open && !disabled && createPortal(
        <div
          className="snt-drp-popover"
          role="dialog"
          ref={popoverRef}
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="snt-drp-popover-tail" />
          {showCalendarMode ? (
            <>
              <div className="snt-drp-popover-header">
                <button
                  type="button"
                  className="snt-drp-month-nav"
                  onClick={() => setViewDate(addMonths(viewDate, -1))}
                  aria-label={t('dateRange.prevMonth')}
                >
                  <ChevronLeft />
                </button>
                <span className="snt-drp-month-title">
                  {formatMonthYear(viewDate, intlLocale)}
                </span>
                <button
                  type="button"
                  className="snt-drp-month-nav"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  aria-label={t('dateRange.nextMonth')}
                >
                  <ChevronRight />
                </button>
              </div>
              <div className="snt-drp-weekdays">
                {weekdayLabels.map((w, i) => (
                  <span key={i} className="snt-drp-weekday">{w}</span>
                ))}
              </div>
              <div className="snt-drp-days">
                {buildMonthGrid(viewDate, weekStartIdx).map((d) => {
                  const inMonth = d.getMonth() === viewDate.getMonth()
                  const isToday = sameDay(d, new Date())
                  const isOutOfBounds =
                    (minDate && d < startOfDay(minDate)) ||
                    (maxDate && d > endOfDay(maxDate))
                  const ds = startOfDay(d)
                  let inSelection = false
                  let isRangeStart = false
                  let isRangeEnd = false
                  if (value.viewMode === 'custom' && rangeAnchor && previewStart && previewEnd) {
                    inSelection = ds >= previewStart && ds <= previewEnd
                    isRangeStart = sameDay(ds, previewStart)
                    isRangeEnd = sameDay(ds, previewEnd)
                  } else if (selStart && selEnd) {
                    inSelection = ds >= selStart && ds <= selEnd
                    isRangeStart = sameDay(ds, selStart)
                    isRangeEnd = sameDay(ds, selEnd)
                  }
                  const isSingle = isRangeStart && isRangeEnd
                  const cls = [
                    'snt-drp-day',
                    inMonth ? '' : 'out-of-month',
                    inSelection ? 'in-range' : '',
                    isRangeStart ? 'range-start' : '',
                    isRangeEnd ? 'range-end' : '',
                    isSingle ? 'range-single' : '',
                    isToday ? 'today' : '',
                    isOutOfBounds ? 'disabled' : '',
                  ].filter(Boolean).join(' ')
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      className={cls}
                      onClick={() => !isOutOfBounds && handleDayClick(d)}
                      onMouseEnter={() => value.viewMode === 'custom' && setHoverDate(d)}
                      disabled={isOutOfBounds}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div className="snt-drp-popover-header">
                <button
                  type="button"
                  className="snt-drp-month-nav"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))}
                  aria-label={t('dateRange.prevYear')}
                >
                  <ChevronLeft />
                </button>
                <span className="snt-drp-month-title">{viewDate.getFullYear()}</span>
                <button
                  type="button"
                  className="snt-drp-month-nav"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))}
                  aria-label={t('dateRange.nextYear')}
                >
                  <ChevronRight />
                </button>
              </div>
              <div className="snt-drp-months">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthStart = new Date(viewDate.getFullYear(), i, 1)
                  const isActive =
                    value.start &&
                    value.start.getFullYear() === viewDate.getFullYear() &&
                    value.start.getMonth() === i
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`snt-drp-month-cell${isActive ? ' active' : ''}`}
                      onClick={() => handleMonthClick(i)}
                    >
                      {formatMonthShort(monthStart, intlLocale)}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          <button type="button" className="snt-drp-today" onClick={goToToday}>
            {t('dateRange.today')}
          </button>
        </div>,
        document.body,
      )}
    </div>
  )
}

/**
 * Build a default value for the picker. Returns { viewMode, start, end } as JS Dates.
 *
 * Accepts either a built-in view mode ('day'|'week'|'month'|'custom') or a preset
 * key from DATE_RANGE_PRESETS (e.g. 'last_12_months', 'rolling_12_months'). Preset
 * keys resolve to a { viewMode: 'custom', start, end } range so the picker shows the
 * range and auto-highlights the matching preset button.
 */
export function getDefaultDateRange(viewModeOrPreset = 'week', weekStart = 'MONDAY') {
  if (isPresetKey(viewModeOrPreset)) {
    const r = getPresetRange(viewModeOrPreset, new Date(), weekStart)
    if (r) return { viewMode: 'custom', start: r.start, end: r.end }
  }
  const today = new Date()
  const weekStartIdx = weekStartIndex(weekStart)
  const range = snapToMode(viewModeOrPreset, { start: today, end: today }, weekStartIdx)
  return { viewMode: viewModeOrPreset, ...range }
}
