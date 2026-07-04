/**
 * SntToolbar - Horizontal toolbar for grouping actions
 *
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Toolbar content (buttons, spacers, etc.)
 */
export function SntToolbar({ className = '', children }) {
  return (
    <div className={`snt-toolbar ${className}`.trim()}>
      {children}
    </div>
  )
}

/**
 * SntToolbarSpacer - Visual separator in toolbars
 */
export function SntToolbarSpacer() {
  return <div className="snt-toolbar-spacer" />
}
