/**
 * SntGrid - Responsive grid layout with equal-height items
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Grid items
 * @param {number} props.minItemWidth - Minimum item width in pixels (default: 350)
 * @param {number} props.gap - Gap between items in pixels (default: 20)
 * @param {string} props.className - Additional CSS classes
 */
export function SntGrid({ children, minItemWidth = 350, gap = 20, className = '' }) {
  const style = {
    '--grid-min-width': `${minItemWidth}px`,
    '--grid-gap': `${gap}px`,
  }

  return (
    <div className={`snt-grid ${className}`.trim()} style={style}>
      {children}
    </div>
  )
}

/**
 * SntGridItem - Item within an SntGrid (ensures equal height)
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Item content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.as - Element type or component to render (default: 'div')
 * @param {object} props.rest - Additional props passed to the element
 */
export function SntGridItem({ children, className = '', as: Component = 'div', ...rest }) {
  return (
    <Component className={`snt-grid-item ${className}`.trim()} {...rest}>
      {children}
    </Component>
  )
}
