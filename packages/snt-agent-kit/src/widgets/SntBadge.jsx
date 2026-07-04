/**
 * SntBadge - Status / label badge component
 *
 * Two flavours: a plain label badge (default) and a dotted badge that leads with
 * an 8px solid status dot. Use the dotted version (`dot`) for status indications.
 *
 * @param {string} variant - Badge color: 'primary', 'secondary', 'success', 'warning', 'danger',
 *                           'info', 'light', 'dark', 'orange', 'salmon', 'purple', 'emerald'
 * @param {string} text - Badge text
 * @param {boolean} dot - Show the leading status dot. Use for status indications.
 * @param {boolean} compact - Use smaller size
 * @param {string} className - Additional CSS classes
 */
export function SntBadge({
  variant = 'secondary',
  text,
  dot = false,
  compact = false,
  className = '',
}) {
  const classes = [
    'snt-badge',
    `snt-badge-${variant}`,
    dot ? 'snt-badge--dot' : '',
    compact ? 'snt-badge-compact' : '',
    className,
  ].filter(Boolean).join(' ')

  return <span className={classes}>{text}</span>
}
