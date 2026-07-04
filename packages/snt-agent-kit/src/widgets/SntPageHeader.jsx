import { useLocale } from '../i18n'
import { useSntUi } from '../SntUiProvider'

/**
 * Back arrow icon
 */
function BackArrowIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

/**
 * SntPageHeader - Page header component matching Sensolus platform style
 *
 * @param {object} props
 * @param {string} props.title - Main page title
 * @param {string} props.backTo - Route to navigate back to (optional)
 * @param {function} props.onBack - Custom back handler (optional, overrides backTo)
 * @param {React.ReactNode} props.actions - Right-aligned action buttons (optional)
 * @param {React.ReactNode} props.children - Additional content after title
 */
export function SntPageHeader({ title, backTo, onBack, actions, children }) {
  const { navigate } = useSntUi()
  const { t } = useLocale()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (navigate) {
      navigate(backTo || -1)
    } else if (backTo) {
      window.location.assign(backTo)
    } else {
      window.history.back()
    }
  }

  const showBackButton = backTo || onBack

  return (
    <div className="snt-page-header">
      <div className="snt-page-header-left">
        {showBackButton && (
          <button
            type="button"
            className="snt-page-header-back"
            onClick={handleBack}
            title={t('common.goBack')}
          >
            <BackArrowIcon size={20} />
          </button>
        )}
        {title && <h1 className="snt-page-header-title">{title}</h1>}
        {children}
      </div>
      {actions && (
        <div className="snt-page-header-actions">
          {actions}
        </div>
      )}
    </div>
  )
}
