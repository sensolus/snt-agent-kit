/**
 * SntSection - Titled page section container
 *
 * A sectioning region for laying out a page: a title, an optional description,
 * and a body. Sits between SntPageHeader (page-level header) and SntCard
 * (content tile) — use it to group related content under a heading.
 *
 * @param {string} title - Section title (rendered as a heading)
 * @param {string} description - Optional subtitle/description below the title
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {ReactNode} children - Section body content
 */
export function SntSection({ title, description, className = '', style = {}, children }) {
  return (
    <section className={`snt-section ${className}`.trim()} style={style}>
      {(title || description) && (
        <div className="snt-section-header">
          {title && <h2 className="snt-section-title">{title}</h2>}
          {description && <p className="snt-section-description">{description}</p>}
        </div>
      )}
      {children && <div className="snt-section-body">{children}</div>}
    </section>
  )
}
