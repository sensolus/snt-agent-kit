/**
 * SntMessage - Inline message box with a colored left border and tinted background.
 *
 * Compose freely with any children (text, multiple paragraphs, custom dividers,
 * footer lines, etc.) — the component only owns the box chrome, not the layout.
 *
 * @param {'info'|'success'|'warning'|'danger'} [variant] - Semantic color. Omit for neutral (no left border).
 * @param {string} [className] - Additional CSS classes.
 * @param {ReactNode} children - Message body.
 */
export function SntMessage({ variant, className = '', children }) {
  const variantClass = variant ? `snt-message--${variant}` : ''
  return (
    <div className={`snt-message ${variantClass} ${className}`.trim()}>
      {children}
    </div>
  )
}
