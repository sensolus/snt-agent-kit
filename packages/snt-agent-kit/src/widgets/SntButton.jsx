import { SntIcon } from './SntIcon'

/**
 * SntButton - Button component
 *
 * The default (white) button is the primary, everyday action. Reach for it in
 * almost all cases. Use 'emphasis' (dark blue) sparingly — only for the single
 * most important action on a screen.
 *
 * @param {string} variant - Button style: 'secondary' (default, white),
 *   'emphasis' (dark blue, use sparingly), 'success', 'danger', 'warning', 'info',
 *   'delete' (white with a 2px red border, red label — for destructive deletes;
 *   the delete icon is added automatically). ('primary' is a deprecated alias for
 *   'emphasis'.)
 * @param {function} onClick - Click handler
 * @param {ReactNode} icon - Optional icon element. For the 'delete' variant the
 *   delete icon is used automatically unless you pass your own.
 * @param {string} text - Button text (alternative to children)
 * @param {string} title - Tooltip text
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {boolean} disabled - Disable button
 * @param {ReactNode} children - Button content
 */
export function SntButton({
  variant = 'secondary',
  onClick,
  icon,
  text = '',
  title = '',
  className = '',
  style = {},
  disabled = false,
  children,
}) {
  const handleClick = (e) => {
    if (!onClick || disabled) return
    e.preventDefault()
    e.stopPropagation()
    onClick(e)
  }

  const variantClass = variant === 'secondary' ? 'snt-btn' : `snt-btn snt-btn-${variant}`

  // Delete buttons always carry the delete icon; callers may override it.
  const resolvedIcon = icon ?? (variant === 'delete' ? <SntIcon name="delete" /> : null)

  return (
    <button
      className={`${variantClass} ${className}`.trim()}
      title={title || text}
      style={style}
      disabled={disabled}
      onClick={handleClick}
      type="button"
    >
      {resolvedIcon && <span style={{ lineHeight: 1.5 }}>{resolvedIcon}</span>}
      {(text || children) && <span className="snt-btn-label">{text || children}</span>}
    </button>
  )
}
