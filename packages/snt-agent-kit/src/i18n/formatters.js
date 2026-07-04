/**
 * Format a date using Intl.DateTimeFormat with the user's locale and timezone.
 */
export function formatDate(date, intlLocale, timezone, options = {}) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone: timezone,
    ...options,
  }).format(d)
}

/**
 * Short date: "23 Mar 2026" style, adapted to locale.
 */
export function formatShortDate(dateStr, intlLocale, timezone) {
  if (!dateStr) return ''
  return formatDate(dateStr, intlLocale, timezone, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Full date+time: "23 Mar 2026, 14:30" style, adapted to locale and timezone.
 */
export function formatDateTime(dateStr, intlLocale, timezone) {
  if (!dateStr) return ''
  return formatDate(dateStr, intlLocale, timezone, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a number according to locale (thousand separators, decimal marks).
 */
export function formatNumber(value, intlLocale) {
  if (value == null) return '-'
  return new Intl.NumberFormat(intlLocale).format(value)
}
