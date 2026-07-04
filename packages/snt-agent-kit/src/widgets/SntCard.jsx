import { SntBadge } from './SntBadge'

/**
 * SntCard - Card container component
 *
 * @param {string} image - Image URL for card header
 * @param {string} title - Card title
 * @param {string} titleIcon - Icon URL for title
 * @param {object} badge - Badge props: { text, variant }
 * @param {ReactNode} titleButton - Button element for title area
 * @param {function} onClick - Click handler (makes card clickable)
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Card body content
 */
export function SntCard({
  image,
  title,
  titleIcon,
  badge,
  titleButton,
  onClick,
  className = '',
  children,
}) {
  return (
    <div
      className={`snt-card ${onClick ? 'snt-card-clickable' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      {image && (
        <div className="snt-card-image">
          <img src={image} alt={title || 'Card image'} />
          {badge && (
            <div className="snt-card-badge">
              <SntBadge {...badge} />
            </div>
          )}
        </div>
      )}

      {title && (
        <div className="snt-card-title-wrapper">
          <div className="snt-card-title">
            {titleIcon && <img src={titleIcon} alt="" className="snt-card-title-icon" />}
            <span>{title}</span>
          </div>
          {titleButton && <div className="snt-card-title-button">{titleButton}</div>}
        </div>
      )}

      {children && <div className="snt-card-body">{children}</div>}
    </div>
  )
}
