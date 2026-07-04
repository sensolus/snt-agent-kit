/**
 * SntIcon - Named SVG icon from the Sensolus icon set
 *
 * Icons inherit their color from the surrounding text (`currentColor`), so they
 * adapt automatically to button variants, links, etc. Pass `size` to scale.
 *
 * @param {string} name - Icon name (see SNT_ICON_NAMES). Unknown names render nothing.
 * @param {number|string} size - Width & height in px (number) or any CSS length. Default 16.
 * @param {string} title - Accessible label. When omitted the icon is aria-hidden (decorative).
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 *
 * Usage:
 *   <SntIcon name="export" />
 *   <SntButton icon={<SntIcon name="download" />}>Download</SntButton>
 */

// Icon glyphs. Each entry is the inner SVG content for a 16×16 viewBox, with
// fills set to `currentColor` so the icon takes the surrounding text color.
const SNT_ICONS = {
  export: (
    <>
      <path d="M11.5 3L8.8968 0H15.9999V7.10396L13.5 4.5L8.8968 9.00176L7.00148 7.10396L11.5 3Z" />
      <path d="M1.99999 14H13.9999V10H15.9999V15C15.9999 15.5523 15.5522 16 14.9999 16H1C0.447715 16 0 15.5523 0 15V1.00009C0 0.447807 0.447714 9.15527e-05 0.999999 9.15527e-05H5.99996V2.00008H1.99999V14Z" />
    </>
  ),
  download: (
    <>
      <path d="M4.414 5.29931L2.99994 6.62499L7.99994 11.3125L12.9999 6.62499L11.5859 5.29931L8.99994 7.72363L8.99994 1H6.99995L6.99995 7.72363L4.414 5.29931Z" />
      <path d="M0 9.99999V15L16 15L16 10L14 10L14 13L2 13L2 9.99999H0Z" />
    </>
  ),
  settings: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.1701 8C14.1701 8.264 14.1455 8.52 14.1126 8.776L15.8479 10.104C16.0042 10.224 16.0453 10.44 15.9466 10.616L14.3017 13.384C14.203 13.56 13.981 13.624 13.8 13.56L11.7522 12.752C11.3245 13.072 10.8804 13.336 10.3622 13.544L10.0579 15.664C10.025 15.856 9.85231 16 9.6467 16H6.35693C6.15132 16 5.97861 15.856 5.94571 15.664L5.64141 13.544C5.12327 13.344 4.67915 13.072 4.25148 12.752L2.2036 13.56C2.02266 13.624 1.8006 13.56 1.70191 13.384L0.0570213 10.616C-0.0498963 10.44 -0.000549714 10.224 0.155714 10.104L1.89107 8.776C1.85817 8.52 1.8335 8.264 1.8335 8C1.8335 7.736 1.85817 7.472 1.89107 7.2L0.155714 5.896C-0.000549714 5.776 -0.0498963 5.56 0.0570213 5.384L1.70191 2.616C1.8006 2.44 2.02266 2.368 2.2036 2.44L4.25148 3.24C4.67915 2.928 5.12327 2.656 5.64141 2.456L5.94571 0.336C5.97861 0.144 6.15132 0 6.35693 0H9.6467C9.85231 0 10.025 0.144 10.0579 0.336L10.3622 2.456C10.8804 2.656 11.3245 2.928 11.7522 3.24L13.8 2.44C13.981 2.368 14.203 2.44 14.3017 2.616L15.9466 5.384C16.0453 5.56 16.0042 5.776 15.8479 5.896L14.1126 7.2C14.1455 7.472 14.1701 7.736 14.1701 8ZM5.12329 8.0002C5.12329 9.5442 6.41453 10.8002 8.00184 10.8002C9.58916 10.8002 10.8804 9.5442 10.8804 8.0002C10.8804 6.4562 9.58916 5.2002 8.00184 5.2002C6.41453 5.2002 5.12329 6.4562 5.12329 8.0002Z"
    />
  ),
  pdf: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.2 0C2.32 0 1.6 0.72 1.6 1.6V14.4C1.6 15.28 2.32 16 3.2 16H12.8C13.68 16 14.4 15.28 14.4 14.4V4.8L9.6 0H3.2ZM8.8 5.60001V1.20001L13.2 5.60001H8.8Z"
    />
  ),
  report: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.4 0.800003H13.6C14.48 0.800003 15.2 1.512 15.2 2.4V13.6C15.2 14.48 14.48 15.2 13.6 15.2H2.4C1.52 15.2 0.800003 14.48 0.800003 13.6V2.4C0.800003 1.512 1.512 0.800003 2.4 0.800003ZM12 5.6H4V4H12V5.6ZM4 8.8H12V7.20001H4V8.8ZM4 12H9.6V10.4H4V12Z"
    />
  ),
  edit: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.74 2.33968C16.0867 2.66852 16.0867 3.24622 15.74 3.59283L14.1047 5.21928L10.7718 1.88641L12.4072 0.259964C12.7538 -0.0866546 13.3315 -0.0866546 13.6603 0.259964L15.74 2.33968ZM0 16V12.6671L9.82975 2.8285L13.1626 6.16137L3.33287 16H0Z"
    />
  ),
  check: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5 2L6 9.5L2.5 6L0 8.5L6 14.5L16 4.5L13.5 2Z"
    />
  ),
  delete: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 0V1H16V3H14V14.1429C14 15.1671 13.2311 16 12.2857 16H3.71429C2.76886 16 2 15.1671 2 14.1429V3H0V1H5V0H11ZM4 3V14H12L11.9992 3H4ZM6 4H7V13H6V4ZM10 4H9V13H10V4Z"
    />
  ),
  list: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.800003 8.8H2.4V7.2H0.800003V8.8ZM0.800003 12H2.4V10.4H0.800003V12ZM0.800003 5.6H2.4V4H0.800003V5.6ZM4 8.8H15.2V7.2H4V8.8ZM4 12H15.2V10.4H4V12ZM4 4V5.6H15.2V4H4Z"
    />
  ),
  map: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.8 0.800003L14.672 0.824003L10.4 2.48L5.6 0.800003L1.088 2.32C0.919999 2.376 0.799999 2.52 0.799999 2.704V14.8C0.799999 15.024 0.975999 15.2 1.2 15.2L1.328 15.176L5.6 13.52L10.4 15.2L14.912 13.68C15.08 13.624 15.2 13.48 15.2 13.296V1.2C15.2 0.976003 15.024 0.800003 14.8 0.800003ZM10.4 13.6L5.59999 11.912V2.4L10.4 4.088V13.6Z"
    />
  ),
  // Funnel filter glyph. No source SVG was supplied for "filter", so this is a
  // standard funnel drawn to match the 16×16 set; fill takes the text colour.
  filter: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 1H16L10 9V14L6 16V9L0 1Z"
    />
  ),
  // Card is an outline glyph — render as strokes (fill:none) so it reads as a
  // 2×2 grid outline; stroke takes the surrounding text colour.
  card: (
    <path
      d="M2 9.5H6C6.27614 9.5 6.5 9.72386 6.5 10V14C6.5 14.2761 6.27614 14.5 6 14.5H2C1.72386 14.5 1.5 14.2761 1.5 14V10C1.5 9.72386 1.72386 9.5 2 9.5ZM10 9.5H14C14.2761 9.5 14.5 9.72386 14.5 10V14C14.5 14.2761 14.2761 14.5 14 14.5H10C9.72386 14.5 9.5 14.2761 9.5 14V10C9.5 9.72386 9.72386 9.5 10 9.5ZM2 1.5H6C6.27614 1.5 6.5 1.72386 6.5 2V6C6.5 6.27614 6.27614 6.5 6 6.5H2C1.72386 6.5 1.5 6.27614 1.5 6V2C1.5 1.72386 1.72386 1.5 2 1.5ZM10 1.5H14C14.2761 1.5 14.5 1.72386 14.5 2V6C14.5 6.27614 14.2761 6.5 14 6.5H10C9.72386 6.5 9.5 6.27614 9.5 6V2C9.5 1.72386 9.72386 1.5 10 1.5Z"
      fill="none"
      stroke="currentColor"
    />
  ),
}

/** Names available to <SntIcon name="…" />. */
export const SNT_ICON_NAMES = Object.keys(SNT_ICONS)

export function SntIcon({ name, size = 16, title = '', className = '', style = {} }) {
  const glyph = SNT_ICONS[name]
  if (!glyph) return null

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
    >
      {title && <title>{title}</title>}
      {glyph}
    </svg>
  )
}
