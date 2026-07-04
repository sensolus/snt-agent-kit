import { useLocale } from '../i18n'

/**
 * SntSidepanel - Collapsible side panel for filters
 *
 * @param {object} props
 * @param {string} props.title - Panel header title
 * @param {boolean} props.open - Whether the panel is open
 * @param {function} props.onToggle - Callback to toggle panel
 * @param {React.ReactNode} props.children - Panel content
 * @param {number} props.width - Panel width in pixels (default: 280)
 */
export function SntSidepanel({
  title = 'Filters',
  open = true,
  onToggle,
  children,
  width = 280,
}) {
  const { t } = useLocale()
  return (
    <aside
      className={`snt-sidepanel ${open ? 'snt-sidepanel-open' : 'snt-sidepanel-closed'}`}
      style={{ '--sidepanel-width': `${width}px` }}
    >
      <div className="snt-sidepanel-header">
        <h3 className="snt-sidepanel-title">{title}</h3>
        {onToggle && (
          <button
            className="snt-sidepanel-toggle"
            onClick={onToggle}
            aria-label={open ? t('sidepanel.collapse') : t('sidepanel.expand')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              <path d="M10.354 3.646a.5.5 0 0 1 0 .708L6.707 8l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0z" />
            </svg>
          </button>
        )}
      </div>
      <div className="snt-sidepanel-content">{children}</div>
    </aside>
  )
}

/**
 * SntFilterSection - A labeled section within the sidepanel
 */
export function SntFilterSection({ label, children }) {
  return (
    <div className="snt-filter-section">
      {label && <label className="snt-filter-section-label">{label}</label>}
      {children}
    </div>
  )
}
