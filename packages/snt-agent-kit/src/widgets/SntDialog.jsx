import { useEffect, useCallback } from 'react'

/**
 * SntDialog - Modal dialog component
 *
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Callback when dialog should close
 * @param {string} props.title - Dialog title
 * @param {string} props.size - Dialog size: 'small', 'medium', 'large' (default: 'medium')
 * @param {'auto'|'none'} props.scroll - Body scroll model (default: 'auto'):
 *   - 'auto': the dialog body owns the scroll (overflow-y: auto). Best for plain content.
 *   - 'none': the dialog body does not scroll — defer to a fill-capable child that
 *     scrolls internally (e.g. `<SntTable scroll="internal">`). Prevents the
 *     double-scrollbar that appears when both layers try to scroll.
 * @param {boolean} props.fillHeight - When true, the dialog uses the full available
 *   vertical space (height: calc(100vh - 40px)) instead of shrink-wrapping to its
 *   content. Use with `scroll="none"` + a fill-capable child (e.g. `<SntTable
 *   scroll="internal">`) so the child has a definite parent height to fill.
 * @param {React.ReactNode} props.footer - Optional footer content rendered in a
 *   bordered bar at the bottom of the dialog. Typically a row of buttons. Pass
 *   raw children; the bar handles padding, the border, and button alignment.
 * @param {'start'|'end'|'center'|'space-between'} props.footerAlign - How to align
 *   the footer content along the horizontal axis (default: 'start' — left-aligned).
 *   Pass 'end' for the right-aligned Cancel + Primary pattern, or 'space-between'
 *   for a secondary action on the left and primary actions on the right.
 * @param {React.ReactNode} props.children - Dialog content
 */
export function SntDialog({
  open,
  onClose,
  title,
  size = 'medium',
  scroll = 'auto',
  fillHeight = false,
  footer,
  footerAlign = 'start',
  children,
}) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  const dialogClass = [
    'snt-dialog',
    `snt-dialog-${size}`,
    `snt-dialog-scroll-${scroll}`,
    fillHeight ? 'snt-dialog-fill-height' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="snt-dialog-overlay" onClick={onClose}>
      <div className={dialogClass} onClick={(e) => e.stopPropagation()}>
        <div className="snt-dialog-header">
          <h2 className="snt-dialog-title">{title}</h2>
          <button className="snt-dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="snt-dialog-content">{children}</div>
        {footer && (
          <div className={`snt-dialog-footer snt-dialog-footer-align-${footerAlign}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
