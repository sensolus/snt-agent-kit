/**
 * SntSpinner - Loading spinner component
 *
 * @param {string} size - Spinner size: 'small', 'medium', 'large'
 * @param {string} className - Additional CSS classes
 */
export function SntSpinner({
  size = 'medium',
  className = '',
}) {
  return (
    <div className={`snt-spinner snt-spinner-${size} ${className}`.trim()} />
  )
}

/**
 * SntLoadingOverlay - Centered loading spinner with optional message
 *
 * @param {string} message - Optional loading message
 * @param {string} size - Spinner size: 'small', 'medium', 'large'
 * @param {string} className - Additional CSS classes
 */
export function SntLoadingOverlay({
  message,
  size = 'medium',
  className = '',
}) {
  return (
    <div className={`snt-loading-overlay ${className}`.trim()}>
      <SntSpinner size={size} />
      {message && <p className="snt-loading-message">{message}</p>}
    </div>
  )
}
