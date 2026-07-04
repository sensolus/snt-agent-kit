/**
 * SntLink - Text link / link-styled action
 *
 * Renders an anchor when `href` is given (navigation), or a link-styled
 * `<button>` when only `onClick` is given (an in-page action that should look
 * like a link, e.g. a tertiary "Learn more" in a dialog footer). Both share
 * the same `.snt-link` styling (brand blue, underline on hover).
 *
 * @param {string} href - Navigation target. Omit for an action link.
 * @param {function} onClick - Click handler (action links, or augmenting an anchor)
 * @param {string} target - Anchor target (e.g. '_blank'); rel is auto-set for _blank
 * @param {boolean} disabled - Disable an action link
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {ReactNode} children - Link content
 */
export function SntLink({
  href,
  onClick,
  target,
  disabled = false,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const classes = `snt-link ${className}`.trim()

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        style={style}
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      style={style}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
