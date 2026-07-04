import { useState, useMemo } from 'react'
import { useLocale } from '../i18n'

/**
 * Sort icon component - ascending (A-Z with up arrow)
 * Matches the real Sensolus SntSortAZ icon
 */
const SortAscIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <g clipPath="url(#clip0_asc)">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 5L11 0L14 5H12L12 16H10L10 5L8 5Z" />
      <path d="M6.58174 8L6.13164 6.3406H3.86837L3.41826 8H2L4.19108 1H5.80042L8 8H6.58174ZM5.81741 5.10082C5.40127 3.59718 5.16631 2.74682 5.11253 2.54973C5.06157 2.35263 5.02477 2.19687 5.00212 2.08243C4.9087 2.48933 4.64119 3.49546 4.19958 5.10082H5.81741Z" />
      <path d="M6 15H2V14.3126L4.57721 10.8755H2.06985V10H5.93015V10.684L3.35662 14.1245H6V15Z" />
    </g>
    <defs>
      <clipPath id="clip0_asc"><rect width="16" height="16" /></clipPath>
    </defs>
  </svg>
)

/**
 * Sort icon component - descending (Z-A with down arrow)
 * Matches the real Sensolus SntSortZA icon
 */
const SortDescIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <g clipPath="url(#clip0_desc)">
      <path fillRule="evenodd" clipRule="evenodd" d="M14 11L11 16L8 11L10 11L10 0L12 0L12 11L14 11Z" />
      <path d="M7 8H2V7.03762L5.22151 2.22572H2.08732V1H6.91268V1.95759L3.69577 6.77428H7V8Z" />
      <path d="M5.81812 15L5.44303 13.8147H3.55697L3.18188 15H2L3.8259 10H5.16702L7 15H5.81812ZM5.18117 12.9292C4.83439 11.8551 4.63859 11.2477 4.59377 11.1069C4.55131 10.9662 4.52064 10.8549 4.50177 10.7732C4.42392 11.0638 4.20099 11.7825 3.83298 12.9292H5.18117Z" />
    </g>
    <defs>
      <clipPath id="clip0_desc"><rect width="16" height="16" /></clipPath>
    </defs>
  </svg>
)

/**
 * SntTable - Sortable data table component
 *
 * @param {Array} data - Array of data objects to display
 * @param {Array} columns - Array of column definitions:
 *   - key: string - unique column identifier (matches data object keys)
 *   - header: string - column header text
 *   - sortable: boolean (optional) - whether column is sortable (default: true)
 *   - sortKey: string (optional) - alternative key to use for sorting (useful when render transforms data)
 *   - getValue: function (optional) - custom value getter for sorting: (row) => value
 *   - render: function (optional) - custom cell renderer (row, value) => ReactNode
 *   - width: number|string (optional) - fixed column width, applied to both `<th>` and `<td>`
 *     via inline `style.width`. Numbers become pixels (React default); strings pass through
 *     (`'90px'`, `'20%'`, `'8rem'`). When cell content exceeds the width it wraps and the
 *     row grows (no ellipsis); long unbreakable strings (API keys, UUIDs) break at any
 *     character via `overflow-wrap: anywhere`.
 * @param {string} rowKey - Key in data objects to use as unique row identifier (default: 'id')
 * @param {number} defaultPageSize - Initial page size (default: 25)
 * @param {Array} pageSizeOptions - Available page sizes (default: [25, 50, 100])
 * @param {string} emptyMessage - Message when no data (default: 'No data available')
 * @param {string} className - Additional CSS classes
 * @param {'internal'|'none'|'viewport'} scroll - Scroll model (default: 'internal'):
 *   - 'internal': table fills parent height, body scrolls inside (sticky header + footer).
 *     Use when the parent has a bounded height (side panel, dialog body, tab pane).
 *   - 'none': table renders at its natural height with no inner scroller. Use when the
 *     surrounding page or column owns the scroll context.
 *   - 'viewport': cap the table at `calc(100vh - viewportOffset)px`. Top-level pages
 *     that genuinely want a viewport-pinned table can opt in here.
 * @param {number} viewportOffset - Pixel offset subtracted from 100vh when scroll='viewport' (default: 120)
 */
export function SntTable({
  data = [],
  columns = [],
  rowKey = 'id',
  defaultPageSize = 25,
  pageSizeOptions = [25, 50, 100],
  emptyMessage,
  className = '',
  scroll = 'internal',
  viewportOffset = 120,
}) {
  const { t } = useLocale()
  const resolvedEmptyMessage = emptyMessage || t('table.noData')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [sortBy, setSortBy] = useState(null) // { key, desc }

  // Sort all data first, then paginate
  const sortedData = useMemo(() => {
    if (!sortBy) return data

    const sorted = [...data]
    const column = columns.find(col => col.key === sortBy.key)

    sorted.sort((a, b) => {
      let aVal, bVal

      // Use getValue function if provided, otherwise use sortKey or column key
      if (column?.getValue) {
        aVal = column.getValue(a)
        bVal = column.getValue(b)
      } else {
        const sortKey = column?.sortKey || sortBy.key
        aVal = a[sortKey]
        bVal = b[sortKey]
      }

      // Nulls always go to the end
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let comparison = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      }

      return sortBy.desc ? -comparison : comparison
    })

    return sorted
  }, [data, sortBy, columns])

  // Calculate pagination values from sorted data
  const pageCount = Math.ceil(sortedData.length / pageSize)

  // Get current page slice
  const currentPageData = useMemo(() => {
    const startIndex = pageIndex * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, pageIndex, pageSize])

  const handleSort = (columnKey) => {
    const column = columns.find(col => col.key === columnKey)
    if (column?.sortable === false) return

    setSortBy(prev => {
      if (prev?.key === columnKey) {
        // Toggle direction
        return { key: columnKey, desc: !prev.desc }
      }
      // New column, start ascending
      return { key: columnKey, desc: false }
    })
    // Reset to first page when sorting changes
    setPageIndex(0)
  }

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setPageIndex(0)
  }

  const canPrevious = pageIndex > 0
  const canNext = pageIndex < pageCount - 1

  const visibleFrom = sortedData.length === 0 ? 0 : pageIndex * pageSize + 1
  const visibleTo = Math.min((pageIndex + 1) * pageSize, sortedData.length)

  // Hide pagination controls when all data fits in the smallest available page size —
  // neither resizing nor paging would change what's displayed.
  const smallestPageSize = Math.min(defaultPageSize, ...pageSizeOptions)
  const showPaginationControls = sortedData.length > smallestPageSize

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i)
    }
    const pages = []
    pages.push(0)
    if (pageIndex > 3) pages.push('...')
    for (let i = Math.max(1, pageIndex - 1); i <= Math.min(pageCount - 2, pageIndex + 1); i++) {
      pages.push(i)
    }
    if (pageIndex < pageCount - 4) pages.push('...')
    if (pageCount > 1) pages.push(pageCount - 1)
    return pages
  }

  const containerClass = `snt-table-container snt-table-scroll-${scroll} ${className}`.trim()
  const containerStyle =
    scroll === 'viewport' ? { maxHeight: `calc(100vh - ${viewportOffset}px)` } : undefined

  return (
    <div className={containerClass} style={containerStyle}>
      <div className="snt-table-wrapper">
        <table className="snt-table">
          <thead>
            <tr>
              {columns.map(column => {
                const isSortable = column.sortable !== false
                const isSorted = sortBy?.key === column.key
                const isDesc = sortBy?.desc

                return (
                  <th
                    key={column.key}
                    className={isSortable ? 'sortable' : ''}
                    style={column.width != null ? { width: column.width } : undefined}
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.header}</span>
                    {isSortable && (
                      isSorted ? (
                        <span className="sort-icon sort-icon-active">
                          {isDesc ? <SortDescIcon /> : <SortAscIcon />}
                        </span>
                      ) : (
                        <span className="sort-icon sort-icon-hover">
                          <SortAscIcon />
                        </span>
                      )
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {currentPageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-cell">
                  {resolvedEmptyMessage}
                </td>
              </tr>
            ) : (
              currentPageData.map((row, idx) => (
                <tr
                  key={row[rowKey] ?? `row-${idx}`}
                  className={idx % 2 === 0 ? 'odd' : 'even'}
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      style={column.width != null ? { width: column.width } : undefined}
                    >
                      {column.render
                        ? column.render(row, row[column.key])
                        : (row[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="snt-table-footer">
        <div className="footer-left">
          {showPaginationControls
            ? t('table.showing', visibleFrom, visibleTo, sortedData.length)
            : t('table.showingTotal', sortedData.length)}
        </div>
        {showPaginationControls && (
          <div className="footer-right">
            <select
              className="snt-page-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{t('table.showN', size)}</option>
              ))}
            </select>

            <div className="snt-pagination">
              <button
                className="snt-page-btn"
                disabled={!canPrevious}
                onClick={() => setPageIndex(pageIndex - 1)}
              >
                ‹
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="snt-page-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`snt-page-btn ${pageIndex === page ? 'active' : ''}`}
                    onClick={() => setPageIndex(page)}
                  >
                    {page + 1}
                  </button>
                )
              )}
              <button
                className="snt-page-btn"
                disabled={!canNext}
                onClick={() => setPageIndex(pageIndex + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
