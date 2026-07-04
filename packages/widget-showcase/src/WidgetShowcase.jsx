import { useState, useEffect } from 'react'
import {
  SntBadge,
  SntButton,
  SntButtonGroup,
  SntCard,
  SntCheckboxList,
  SntIcon,
  SNT_ICON_NAMES,
  SntLink,
  SntColors,
  SntBadgeColors,
  SntDateRangePicker,
  SntDeviceLayer,
  SntDialog,
  SntGeozoneLayer,
  SntGrid,
  SntGridItem,
  SntHistogram,
  SntInput,
  SntLoadingOverlay,
  SntMap,
  SntMessage,
  SntPageHeader,
  SntProgressBar,
  SntSelect,
  SntMultiSelect,
  SntSidepanel,
  SntFilterSection,
  SntSection,
  SntSpinner,
  SntSummaryStat,
  SntSwitch,
  SntTable,
  SntTabs,
  SntTabPanel,
  SntToolbar,
  SntToolbarSpacer,
  DATE_RANGE_PRESETS,
  getDefaultDateRange,
  getPresetRange,
  useLayerToggle,
  useSntMap,
} from '@sensolus/snt-agent-kit'

// Map tile keys come from Vite env vars (VITE_MAPBOX_KEY / VITE_LOCATIONIQ_KEY).
// In the real sample app these are fetched at runtime from /api/config so one
// Docker image can deploy across envs — the showcase has no backend, so we
// read them directly from import.meta.env. Map sections degrade gracefully
// when the keys are absent.
const config = {
  mapboxKey: import.meta.env.VITE_MAPBOX_KEY,
  locationiqKey: import.meta.env.VITE_LOCATIONIQ_KEY,
}

function slugifyTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function Section({ title, description, children }) {
  return (
    <div id={slugifyTitle(title)} className="showcase-section">
      <SntSection title={title} description={description}>
        <div className="showcase-section-body">{children}</div>
      </SntSection>
    </div>
  )
}

const SECTION_TITLES = [
  'Page layout',
  'Typography',
  'SntPageHeader', 'SntButton', 'SntBadge', 'SntMessage', 'SntInput', 'SntSelect',
  'SntMultiSelect',
  'SntButtonGroup', 'SntSwitch', 'SntCheckboxList', 'SntDateRangePicker', 'SntCard', 'SntSection',
  'SntGrid + SntGridItem', 'SntToolbar', 'SntTabs + SntTabPanel', 'SntTable',
  'SntSummaryStat', 'SntProgressBar', 'SntHistogram', 'SntSpinner + SntLoadingOverlay',
  'SntDialog', 'SntSidepanel + SntFilterSection', 'SntMap', 'SntColors',
  'Examples',
]

function ShowcaseIndex() {
  return (
    <SntCard title="Index">
      <ul className="showcase-index">
        {SECTION_TITLES.map((title) => (
          <li key={title}>
            <a href={`#${slugifyTitle(title)}`}>{title}</a>
          </li>
        ))}
      </ul>
    </SntCard>
  )
}

function Example({ label, children }) {
  return (
    <div className="showcase-example">
      <div className="showcase-example-label">{label}</div>
      <div className="showcase-example-body">{children}</div>
    </div>
  )
}

const BADGE_VARIANTS = [
  'primary', 'secondary', 'success', 'warning', 'danger',
  'info', 'light', 'dark', 'orange', 'salmon', 'purple', 'emerald',
]

const BUTTON_VARIANTS = ['secondary', 'emphasis', 'success', 'danger', 'warning', 'info']

const TABLE_DATA = [
  { id: 1, name: 'Alpha Logistics',  trackers: 142, status: 'Active'   },
  { id: 2, name: 'Beta Transport',   trackers:  56, status: 'Active'   },
  { id: 3, name: 'Gamma Couriers',   trackers:   8, status: 'Inactive' },
  { id: 4, name: 'Delta Freight',    trackers: 231, status: 'Active'   },
  { id: 5, name: 'Epsilon Shipping', trackers:  17, status: 'Pending'  },
]

// Lorem-ipsum filler for the Examples section (page-template compositions).
const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
const LOREM_TABLE = [
  { id: 1, lorem: 'Lorem ipsum',  ipsum: 'Dolor sit',   dolor: 'Amet'   },
  { id: 2, lorem: 'Consectetur',  ipsum: 'Adipiscing',  dolor: 'Elit'   },
  { id: 3, lorem: 'Sed do',       ipsum: 'Eiusmod',     dolor: 'Tempor' },
  { id: 4, lorem: 'Incididunt',   ipsum: 'Ut labore',   dolor: 'Magna'  },
]
const LOREM_COLUMNS = [
  { key: 'lorem', header: 'Lorem' },
  { key: 'ipsum', header: 'Ipsum' },
  { key: 'dolor', header: 'Dolor' },
]

const DIALOG_TABLE_DATA = Array.from({ length: 80 }, (_, i) => {
  const cycle = ['Active', 'Active', 'Active', 'Pending', 'Inactive']
  return {
    id: i + 1,
    name: `Fleet vehicle ${String(i + 1).padStart(3, '0')}`,
    trackers: 5 + ((i * 13) % 240),
    status: cycle[i % cycle.length],
  }
})

const STATUS_VARIANT = {
  Active: 'success',
  Inactive: 'secondary',
  Pending: 'warning',
}

const HISTOGRAM_BUCKETS = [
  { start: 0,   end: 10,  count: 4  },
  { start: 10,  end: 20,  count: 12 },
  { start: 20,  end: 30,  count: 28 },
  { start: 30,  end: 40,  count: 19 },
  { start: 40,  end: 50,  count: 9  },
  { start: 50,  end: 60,  count: 3  },
]

const TAB_DEFS = [
  { key: 'one',   label: 'Tab one'   },
  { key: 'two',   label: 'Tab two'   },
  { key: 'three', label: 'Tab three' },
]

const DEMO_DEVICES = [
  { id: 'd1', name: 'Demo tracker A', lastLat: 50.8503, lastLng: 4.3517 },
  { id: 'd2', name: 'Demo tracker B', lastLat: 51.2194, lastLng: 4.4025 },
  { id: 'd3', name: 'Demo tracker C', lastLat: 51.0543, lastLng: 3.7174 },
  { id: 'd4', name: 'Demo tracker D', lastLat: 50.6326, lastLng: 5.5797 },
  { id: 'd5', name: 'Demo tracker E', lastLat: 51.2093, lastLng: 3.2247 },
]

// Fixed sample geozones. Shape matches what the Sensolus API returns, so they
// flow into SntGeozoneLayer without any adapter.
const DEMO_GEOZONES = [
  {
    id: 'gz-brussels',
    name: 'Brussels distribution hub',
    surface: 1,
    circleGeozone: { point: { x: 50.8503, y: 4.3517 }, radius: 6000 },
    borderColor: '#0071A1',
    contentColor: '#A0C3D8',
  },
  {
    id: 'gz-antwerp',
    name: 'Antwerp port',
    surface: 2,
    circleGeozone: { point: { x: 51.2194, y: 4.4025 }, radius: 5000 },
    borderColor: '#39CB99',
    contentColor: '#39CB99',
  },
  {
    id: 'gz-ghent-poly',
    name: 'Ghent service area',
    surface: 3,
    coordinates: [
      { x: 51.08, y: 3.65 },
      { x: 51.08, y: 3.78 },
      { x: 51.02, y: 3.78 },
      { x: 51.02, y: 3.65 },
    ],
    borderColor: '#FFCC66',
    contentColor: '#FFCC66',
  },
]

// Fixed sample heat points across Belgium with synthetic intensity.
const HEAT_POINTS = [
  { lat: 50.8503, lng: 4.3517, intensity: 0.95 }, // Brussels
  { lat: 51.2194, lng: 4.4025, intensity: 0.85 }, // Antwerp
  { lat: 51.0543, lng: 3.7174, intensity: 0.65 }, // Ghent
  { lat: 50.6326, lng: 5.5797, intensity: 0.50 }, // Liège
  { lat: 51.2093, lng: 3.2247, intensity: 0.40 }, // Bruges
  { lat: 50.4674, lng: 4.8720, intensity: 0.35 }, // Namur
  { lat: 50.4543, lng: 3.9522, intensity: 0.30 }, // Mons
  { lat: 50.8798, lng: 4.7005, intensity: 0.55 }, // Leuven
]

function heatColor(t) {
  if (t < 0.25) return SntColors.blue
  if (t < 0.50) return SntColors.green
  if (t < 0.75) return SntColors.yellow
  return SntColors.red
}

const HEAT_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>" +
    "<defs><radialGradient id='g' cx='50%' cy='50%' r='50%'>" +
    "<stop offset='0%' stop-color='#E00000' stop-opacity='0.95'/>" +
    "<stop offset='35%' stop-color='#FFCC66' stop-opacity='0.9'/>" +
    "<stop offset='70%' stop-color='#39CB99' stop-opacity='0.65'/>" +
    "<stop offset='100%' stop-color='#0071A1' stop-opacity='0.25'/>" +
    "</radialGradient></defs>" +
    "<rect width='32' height='32' fill='#fff'/>" +
    "<circle cx='16' cy='16' r='14' fill='url(#g)'/></svg>"
)}`

// Custom layer demonstrating the SntMap composition API. useSntMap() hands you
// the Leaflet map + bundled L so you can add your own layers; useLayerToggle()
// registers a chip in the bottom-left Layers control and returns the current
// visibility — no local state or second effect needed.
function DemoHeatLayer({ points }) {
  const { map, L } = useSntMap()
  const visible = useLayerToggle({ id: 'heatmap', label: 'Heatmap', icon: HEAT_ICON })

  useEffect(() => {
    if (!map || !visible) return
    const group = L.featureGroup()
    for (const p of points) {
      L.circle([p.lat, p.lng], {
        radius: 6000 + p.intensity * 22000,
        weight: 0,
        fillColor: heatColor(p.intensity),
        fillOpacity: 0.35,
      }).addTo(group)
    }
    group.addTo(map)
    return () => { map.removeLayer(group) }
  }, [map, L, points, visible])

  return null
}

export function WidgetShowcase() {
  const [inputValue, setInputValue] = useState('Hello world')
  const [selectValue, setSelectValue] = useState('eu')
  const [multiSelectValue, setMultiSelectValue] = useState(['eu', 'apac'])
  const [groupValue, setGroupValue] = useState('cards')
  const [switchOn, setSwitchOn] = useState(true)
  const [activeOnly, setActiveOnly] = useState(true)
  const [checkboxSelected, setCheckboxSelected] = useState(['Trackers', 'Geozones'])
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange('week'))
  const [presetRange, setPresetRange] = useState(() => ({ viewMode: 'custom', ...getPresetRange('last_7d') }))
  const [verticalRange, setVerticalRange] = useState(() => ({ viewMode: 'custom', ...getPresetRange('last_30d') }))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogLeftAlignOpen, setDialogLeftAlignOpen] = useState(false)
  const [dialogTableOpen, setDialogTableOpen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [sidepanelOpen, setSidepanelOpen] = useState(true)
  const [showcaseTab, setShowcaseTab] = useState('one')
  const [statFilter, setStatFilter] = useState('active')
  const [exampleStatActive, setExampleStatActive] = useState(true)
  const [exampleChecks, setExampleChecks] = useState(['Lorem', 'Dolor'])

  return (
    <div className="page-root">
      <div className="page-body widget-showcase">
      <div className="showcase-layout">
      <aside className="showcase-index-col">
        <ShowcaseIndex />
      </aside>
      <main className="showcase-main">
      <SntCard>
        <p style={{ margin: 0, color: 'var(--snt-grey)' }}>
          Live reference of every Sensolus widget shipped with this app. Each card
          shows the widget, what it&apos;s for, and a handful of common configurations.
          Widgets come from <code>@sensolus/snt-agent-kit</code> — import it, don&apos;t copy it.
        </p>
      </SntCard>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="Page layout"
        description="Every page in this app is wrapped in a .page-root div which carries the standard page padding: 24px on top, 16px on the left and right, 16px on the bottom. Don't add your own outer padding — just render your content inside .page-root (typically wrapped in a .page-body for vertical content spacing)."
      >
        <Example label="Spec — .page-root padding: 24px 16px 16px">
          <div className="showcase-page-layout-demo">
            <div className="showcase-page-layout-demo-inner">
              Page content sits inside .page-root with 24px top / 16px sides / 16px bottom
            </div>
          </div>
        </Example>
        <Example label="Rule — summary stats live on the page, not in a panel">
          <div className="summary-stats-row">
            <SntSummaryStat value="142" label="Trackers" variant="info" />
            <SntSummaryStat value="36"  label="Users"    variant="success" />
            <SntSummaryStat value="3"   label="Alerts"   variant="warning" />
          </div>
        </Example>
        <Example label="Rule — cards in a row are equal height (tallest wins)">
          <div className="showcase-equal-row">
            <SntCard title="Short">
              <p style={{ margin: 0 }}>One line of content.</p>
            </SntCard>
            <SntCard title="Taller">
              <p style={{ margin: 0 }}>
                This card has more content, so it sets the row height — the
                shorter card stretches to match instead of leaving a ragged
                bottom edge.
              </p>
            </SntCard>
          </div>
        </Example>
        <Example label="Rule — auto-width field (min 100px), right-aligned label">
          <div className="showcase-field-row">
            <label>Asset name</label>
            <div className="showcase-field">
              <SntInput value="" onChange={() => {}} placeholder="Auto-width, min 100px" />
            </div>
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="Typography"
        description="Heading hierarchy and body text. Raw h1–h4 and p elements are styled by the theme, so plain markup reads with the correct structure — no per-page CSS. Sizes come from the --snt-font-size-h1…h4 tokens (24 / 20 / 16 / 14px); paragraphs use the 14px base."
      >
        <Example label="Headings — h1 → h4">
          <h1>h1 — Page title (24px / 700)</h1>
          <h2>h2 — Section heading (20px / 600)</h2>
          <h3>h3 — Subsection heading (16px / 600)</h3>
          <h4>h4 — Minor heading (14px / 600)</h4>
        </Example>
        <Example label="Paragraph text">
          <p>
            Body copy uses the 14px base size with 1.5 line-height and the
            secondary text colour. Paragraphs carry bottom spacing so stacked
            text blocks separate cleanly.
          </p>
          <p>
            A second paragraph shows the rhythm between blocks. The last
            paragraph in a container drops its bottom margin so it doesn't add
            stray space.
          </p>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntPageHeader"
        description="Standard page-level header: title (h1), optional back button, and right-aligned actions slot. Use this on every page — don't hand-roll an h1 + back chevron. backTo is wired through SntUiProvider's navigate adapter, so it integrates with react-router automatically."
      >
        <Example label="Title + back + actions">
          <div className="showcase-page-header-demo">
            <SntPageHeader
              title="Organisation detail"
              backTo="/organisations"
              actions={
                <>
                  <SntButton icon={<SntIcon name="export" />}>Export</SntButton>
                  <SntButton icon={<SntIcon name="edit" />}>Edit</SntButton>
                </>
              }
            />
          </div>
        </Example>
        <Example label="Title only (no back, no actions)">
          <div className="showcase-page-header-demo">
            <SntPageHeader title="Dashboard" />
          </div>
        </Example>
        <Example label="With onBack callback (custom navigation)">
          <div className="showcase-page-header-demo">
            <SntPageHeader
              title="Edit profile"
              onBack={() => alert('onBack fired — use this when you need custom navigation logic instead of a path')}
            />
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntButton"
        description="The default (white) button is the everyday primary action — reach for it almost always. Use 'emphasis' (dark blue) sparingly for the single most important action on a screen."
      >
        <Example label="Variants">
          <div className="showcase-row">
            {BUTTON_VARIANTS.map((v) => (
              <SntButton key={v} variant={v}>{v === 'secondary' ? 'Primary' : v}</SntButton>
            ))}
          </div>
        </Example>
        <Example label="Disabled">
          <SntButton disabled>Disabled</SntButton>
        </Example>
        <Example label="With icon">
          <SntButton icon={<SntIcon name="export" />}>Export</SntButton>
        </Example>
        <Example label="Delete (white, 2px red border, red label — delete icon added automatically)">
          <SntButton variant="delete" onClick={() => {}}>Delete</SntButton>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntIcon"
        description="Named SVG icons from the Sensolus set. Icons inherit the surrounding text color (currentColor), so they adapt to button variants, links, etc. Set size to scale. For action buttons (export, download, settings, PDF, report) put the matching icon in the button."
      >
        <Example label="All icons">
          <div className="showcase-row" style={{ alignItems: 'center', gap: 20 }}>
            {SNT_ICON_NAMES.map((name) => (
              <div
                key={name}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <SntIcon name={name} size={24} title={name} />
                <code style={{ fontSize: 12, color: 'var(--snt-grey)' }}>{name}</code>
              </div>
            ))}
          </div>
        </Example>
        <Example label="In buttons">
          <div className="showcase-row">
            <SntButton icon={<SntIcon name="export" />}>Export</SntButton>
            <SntButton icon={<SntIcon name="download" />}>Download</SntButton>
            <SntButton icon={<SntIcon name="edit" />}>Edit</SntButton>
            <SntButton icon={<SntIcon name="report" />}>Report</SntButton>
            <SntButton icon={<SntIcon name="pdf" />}>PDF</SntButton>
            <SntButton icon={<SntIcon name="settings" />}>Settings</SntButton>
          </div>
        </Example>
        <Example label="Sizes">
          <div className="showcase-row" style={{ alignItems: 'center' }}>
            <SntIcon name="settings" size={16} />
            <SntIcon name="settings" size={24} />
            <SntIcon name="settings" size={32} />
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntLink"
        description="Brand-blue text link (underline on hover). Renders an <a> with href, or a link-styled <button> with onClick — use the action form for tertiary actions like a dialog's 'Learn more'."
      >
        <Example label="Navigation link">
          <SntLink href="https://www.sensolus.com" target="_blank">Visit sensolus.com</SntLink>
        </Example>
        <Example label="Action link (button under the hood)">
          <SntLink onClick={() => alert('Learn more clicked')}>Learn more</SntLink>
        </Example>
        <Example label="Inline in text">
          <p style={{ margin: 0 }}>
            Need help? <SntLink href="#">Read the docs</SntLink> for details.
          </p>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntBadge"
        description="Compact status / label pill. Two flavours: a plain label badge, and a dotted badge (dot) that leads with an 8px solid status dot — use the dotted version for status indications."
      >
        <Example label="Label (no dot)">
          <div className="showcase-row">
            {BADGE_VARIANTS.map((v) => (
              <SntBadge key={v} variant={v} text={v} />
            ))}
          </div>
        </Example>
        <Example label="Status (dot) — for status indications">
          <div className="showcase-row">
            {BADGE_VARIANTS.map((v) => (
              <SntBadge key={v} variant={v} text={v} dot />
            ))}
          </div>
        </Example>
        <Example label="Compact">
          <div className="showcase-row">
            <SntBadge variant="success" text="Active" compact />
            <SntBadge variant="success" text="Active" compact dot />
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntMessage"
        description="Inline contextual message block. Use for empty states, info notes, validation summaries, success confirmations. variant controls the accent stripe and tint: info / success / warning / danger. No variant gives a neutral grey block."
      >
        <Example label="Variants">
          <div className="showcase-stack">
            <SntMessage variant="info">
              <strong>Heads up.</strong> Geozones for this organisation are still syncing — try again in a minute.
            </SntMessage>
            <SntMessage variant="success">
              <strong>Saved.</strong> Your alert rule is now active across 142 trackers.
            </SntMessage>
            <SntMessage variant="warning">
              <strong>3 trackers low on battery.</strong> Replace them before they go offline.
            </SntMessage>
            <SntMessage variant="danger">
              <strong>Sync failed.</strong> Couldn&rsquo;t reach the Sensolus API. Check your connection and retry.
            </SntMessage>
            <SntMessage>
              No variant set — neutral block for plain helper text or empty-state notes.
            </SntMessage>
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntInput"
        description="Text input. onChange receives the value directly."
      >
        <Example label="Text">
          <SntInput value={inputValue} onChange={setInputValue} placeholder="Type something..." />
        </Example>
        <Example label="With info text (.snt-field-info — 12px, left-aligned)">
          <SntInput value={inputValue} onChange={setInputValue} placeholder="e.g. ACME-EU-01" />
          <span className="snt-field-info">Use the organisation&rsquo;s short code, not its full name.</span>
        </Example>
        <Example label="Password">
          <SntInput type="password" value="hunter2" onChange={() => {}} />
        </Example>
        <Example label="Disabled / read-only">
          <div className="showcase-row">
            <SntInput value="disabled" onChange={() => {}} disabled />
            <SntInput value="read-only" onChange={() => {}} readOnly />
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntSelect"
        description="Native dropdown. options = [{ value, label }]."
      >
        <Example label="Single select">
          <SntSelect
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { value: 'eu', label: 'Europe' },
              { value: 'us', label: 'United States' },
              { value: 'apac', label: 'Asia-Pacific' },
            ]}
          />
        </Example>
        <Example label="With info text (.snt-field-info — 12px, left-aligned)">
          <SntSelect
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { value: 'eu', label: 'Europe' },
              { value: 'us', label: 'United States' },
              { value: 'apac', label: 'Asia-Pacific' },
            ]}
          />
          <span className="snt-field-info">Trackers report times in this region&rsquo;s timezone.</span>
        </Example>
        <Example label="With placeholder">
          <SntSelect
            value=""
            onChange={() => {}}
            placeholder="Pick a region..."
            options={[
              { value: 'eu', label: 'Europe' },
              { value: 'us', label: 'United States' },
            ]}
          />
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntMultiSelect"
        description="Dropdown that lets the user pick several options at once. Trigger looks like SntSelect; clicking it opens a checkbox popover with a select-all toggle. value is an array; onChange always receives the full array of selected values."
      >
        <Example label="Multi-select">
          <SntMultiSelect
            value={multiSelectValue}
            onChange={setMultiSelectValue}
            options={[
              { value: 'eu', label: 'Europe' },
              { value: 'us', label: 'United States' },
              { value: 'apac', label: 'Asia-Pacific' },
              { value: 'mea', label: 'Middle East & Africa' },
              { value: 'latam', label: 'Latin America' },
            ]}
          />
          <span className="snt-field-info">Pick one or more regions to include in the report.</span>
        </Example>
        <Example label="Empty (placeholder)">
          <SntMultiSelect
            value={[]}
            onChange={() => {}}
            placeholder="Pick regions..."
            options={[
              { value: 'eu', label: 'Europe' },
              { value: 'us', label: 'United States' },
            ]}
          />
        </Example>
        <Example label="Disabled">
          <SntMultiSelect
            value={['eu']}
            onChange={() => {}}
            disabled
            options={[
              { value: 'eu', label: 'Europe' },
              { value: 'us', label: 'United States' },
            ]}
          />
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntButtonGroup"
        description="Segmented control for exclusive choices. Great for view toggles."
      >
        <Example label="Toggle">
          <SntButtonGroup
            value={groupValue}
            onChange={setGroupValue}
            options={[
              { value: 'cards', label: 'Cards', icon: <SntIcon name="card" /> },
              { value: 'list',  label: 'List',  icon: <SntIcon name="list" /> },
              { value: 'map',   label: 'Map',   icon: <SntIcon name="map" />  },
            ]}
          />
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntSwitch"
        description="On/off toggle. checked state is controlled."
      >
        <Example label="With label">
          <SntSwitch checked={switchOn} onChange={setSwitchOn} label="Show inactive devices" />
        </Example>
        <Example label="Disabled">
          <SntSwitch checked={true} onChange={() => {}} label="Locked" disabled />
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntCheckboxList"
        description="Multi-select filter with select-all. options is a plain array of strings. layout='vertical' (default) stacks the options in a column; layout='horizontal' flows them in a wrapping inline row."
      >
        <Example label="Vertical (default)">
          <div style={{ maxWidth: 320 }}>
            <SntCheckboxList
              label="Resources"
              options={['Organisations', 'Trackers', 'Users', 'Geozones', 'Alerts']}
              selected={checkboxSelected}
              onChange={setCheckboxSelected}
            />
          </div>
        </Example>
        <Example label="Horizontal (layout='horizontal')">
          <SntCheckboxList
            label="Resources"
            layout="horizontal"
            options={['Organisations', 'Trackers', 'Users', 'Geozones', 'Alerts']}
            selected={checkboxSelected}
            onChange={setCheckboxSelected}
          />
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntDateRangePicker"
        description="Range selection with day / week / month / custom modes. Value is { viewMode, start, end } as JS Dates. Changed in 0.7.1: presets and modes are now merged into a single modes prop — pass any mix of mode names (day/week/month/custom) and DATE_RANGE_PRESETS names (last_7d, this_month, …) and they all render as toggle buttons in one row. Custom is always pushed to the end. Use getPresetRange(name) if you need to compute a range outside the picker."
      >
        <Example label={`Plain modes only: ${dateRange.start.toDateString()} → ${dateRange.end.toDateString()} (${dateRange.viewMode})`}>
          <SntDateRangePicker
            value={dateRange}
            onChange={setDateRange}
            modes={['day', 'week', 'month', 'custom']}
          />
        </Example>
        <Example label={`New in 0.7.1 — presets mixed into the modes row: ${presetRange.start.toDateString()} → ${presetRange.end.toDateString()}`}>
          <SntDateRangePicker
            value={presetRange}
            onChange={setPresetRange}
            modes={['last_48h', 'last_7d', 'last_30d', 'this_week', 'this_month', 'last_month', 'custom']}
          />
        </Example>
        <Example label="All presets exposed by DATE_RANGE_PRESETS — drop any subset into modes={[...]}">
          <div className="showcase-row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {DATE_RANGE_PRESETS.map((name) => (
              <SntBadge key={name} text={name} variant="info" />
            ))}
          </div>
        </Example>
        <Example label={`New in 0.7.4 — direction="vertical" + navigable={false} for a sidebar column of filters: ${verticalRange.start.toDateString()} → ${verticalRange.end.toDateString()}`}>
          <div style={{ width: 260, padding: 16, border: '1px solid var(--snt-grey-light)', borderRadius: 'var(--snt-border-radius)', background: 'var(--snt-white)' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.04em', color: 'var(--snt-grey-darker)', marginBottom: 6 }}>PERIOD:</div>
            <SntDateRangePicker
              value={verticalRange}
              onChange={setVerticalRange}
              direction="vertical"
              navigable={false}
              modes={['last_7d', 'last_30d', 'last_90d', 'this_month', 'last_month', 'custom']}
            />
          </div>
        </Example>
        <Example label="getPresetRange('last_30d') → compute a range without mounting the picker">
          <code style={{ fontSize: 13, color: 'var(--snt-grey-darker)' }}>
            {(() => {
              const r = getPresetRange('last_30d')
              return `{ start: ${r.start.toDateString()}, end: ${r.end.toDateString()} }`
            })()}
          </code>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntCard"
        description="Surface for grouping content. Optional image, title, badge, title button."
      >
        <SntGrid minItemWidth={260}>
          <SntGridItem>
            <SntCard title="Simple card">
              <p>Card body content.</p>
            </SntCard>
          </SntGridItem>
          <SntGridItem>
            <SntCard
              title="With badge"
              badge={{ text: 'NEW', variant: 'success' }}
            >
              <p>Cards can carry a status badge.</p>
            </SntCard>
          </SntGridItem>
          <SntGridItem>
            <SntCard
              title="Clickable"
              onClick={() => alert('Card clicked')}
              titleButton={<SntButton>Open</SntButton>}
            >
              <p>onClick makes the whole card interactive.</p>
            </SntCard>
          </SntGridItem>
        </SntGrid>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntSection"
        description="Titled page section for grouping content (title + optional description + body). Sits between SntPageHeader (page-level) and SntCard (content tile). The playground sections you're reading are themselves SntSection."
      >
        <Example label="Title + description">
          <SntSection
            title="Fleet overview"
            description="Devices reporting in the last 24 hours, grouped by status."
          >
            <p style={{ margin: 0 }}>Section body content goes here.</p>
          </SntSection>
        </Example>
        <Example label="Title only">
          <SntSection title="Recent activity">
            <p style={{ margin: 0 }}>A section with no description.</p>
          </SntSection>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntGrid + SntGridItem"
        description="Responsive equal-height grid. Items wrap based on minItemWidth."
      >
        <SntGrid minItemWidth={140} gap={12}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SntGridItem key={i}>
              <div className="showcase-grid-cell">Item {i + 1}</div>
            </SntGridItem>
          ))}
        </SntGrid>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntToolbar"
        description="Horizontal row for grouping actions, with optional spacer."
      >
        <SntToolbar>
          <SntButton variant="emphasis">Save</SntButton>
          <SntButton>Cancel</SntButton>
          <SntToolbarSpacer />
          <div style={{ width: 220 }}>
            <SntInput value="" onChange={() => {}} placeholder="Search..." />
          </div>
          <SntButton icon={<SntIcon name="filter" />}>Filter</SntButton>
        </SntToolbar>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntTabs + SntTabPanel"
        description="Standard horizontal tab strip. Controlled via activeTab."
      >
        <SntTabs tabs={TAB_DEFS} activeTab={showcaseTab} onChange={setShowcaseTab}>
          <SntTabPanel tabKey="one" activeTab={showcaseTab}>
            <p style={{ padding: '16px 0' }}>Content for tab one.</p>
          </SntTabPanel>
          <SntTabPanel tabKey="two" activeTab={showcaseTab}>
            <p style={{ padding: '16px 0' }}>Content for tab two.</p>
          </SntTabPanel>
          <SntTabPanel tabKey="three" activeTab={showcaseTab}>
            <p style={{ padding: '16px 0' }}>Content for tab three.</p>
          </SntTabPanel>
        </SntTabs>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntTable"
        description="Sortable, paginated data table. Columns define key, header, optional render. New in 0.6.0: scroll prop ('internal' | 'none' | 'viewport') replaces the baked-in calc(100vh - 120px) max-height — pick the mode that matches your page layout."
      >
        <Example label='scroll="none" — flows with the page (no internal scroll, no sticky header). Use inside pages that already scroll.'>
          <SntTable
            data={TABLE_DATA}
            rowKey="id"
            defaultPageSize={25}
            scroll="none"
            columns={[
              { key: 'name',     header: 'Name'     },
              { key: 'trackers', header: 'Trackers' },
              {
                key: 'status',
                header: 'Status',
                render: (row, val) => (
                  <SntBadge variant={STATUS_VARIANT[val] || 'secondary'} text={val} />
                ),
              },
            ]}
          />
        </Example>
        <Example label='scroll="viewport" viewportOffset={240} — pins the table to viewport height minus the offset; sticky header + footer. Matches the 0.5.x default (offset 120).'>
          <SntTable
            data={TABLE_DATA}
            rowKey="id"
            defaultPageSize={25}
            scroll="viewport"
            viewportOffset={240}
            columns={[
              { key: 'name',     header: 'Name'     },
              { key: 'trackers', header: 'Trackers' },
              {
                key: 'status',
                header: 'Status',
                render: (row, val) => (
                  <SntBadge variant={STATUS_VARIANT[val] || 'secondary'} text={val} />
                ),
              },
            ]}
          />
        </Example>
        <Example label='Pagination — 80 rows with defaultPageSize={5}. The footer pager (page-size selector, range label, prev/next) appears whenever the row count exceeds the smallest page size.'>
          <SntTable
            data={DIALOG_TABLE_DATA}
            rowKey="id"
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 25]}
            scroll="none"
            columns={[
              { key: 'name',     header: 'Name'     },
              { key: 'trackers', header: 'Trackers' },
              {
                key: 'status',
                header: 'Status',
                render: (row, val) => (
                  <SntBadge variant={STATUS_VARIANT[val] || 'secondary'} text={val} />
                ),
              },
            ]}
          />
        </Example>
        <Example label='Per-column width — new in 0.7.7. Pass width (number → px, or any CSS string like "20%" / "8rem") on a column and it applies to both <th> and <td>. Here Name is pinned to 120px, Trackers to 90px; Status keeps auto-fill.'>
          <SntTable
            data={TABLE_DATA}
            rowKey="id"
            defaultPageSize={25}
            scroll="none"
            columns={[
              { key: 'name',     header: 'Name',     width: 120 },
              { key: 'trackers', header: 'Trackers', width: 90 },
              {
                key: 'status',
                header: 'Status',
                render: (row, val) => (
                  <SntBadge variant={STATUS_VARIANT[val] || 'secondary'} text={val} />
                ),
              },
            ]}
          />
        </Example>
        <Example label='Long values wrap (no ellipsis) — new in 0.7.7. When cell content is wider than the column, it wraps and the row grows. Long unbreakable strings like API keys or UUIDs break at any character. Here Name is 140px and API key is 160px; the "Number of connected trackers" description column fills the rest.'>
          <SntTable
            data={[
              {
                id: 1,
                name: 'dashboard test',
                apiKey: '3ef45058fc024f17b9e95bbc6f4757ba',
                description: 'A short description that fits on one line.',
              },
              {
                id: 2,
                name: 'Default admin integration for the reporting pipeline',
                apiKey: 'f6eca51a536e4a0c8d15ba810e45f3a5',
                description: 'This description is deliberately long so the row grows vertically — the cell wraps at word boundaries and the neighbouring cells stay aligned to the top of the row.',
              },
              {
                id: 3,
                name: 'Ops',
                apiKey: 'b4c7c1a29b5e4d92a0e6c2f18e59fd11d7c3',
                description: 'Trailing token: aVeryLongUnbrokenIdentifierThatMustAlsoBreakSomewhereInsideTheColumn.',
              },
            ]}
            rowKey="id"
            defaultPageSize={25}
            scroll="none"
            columns={[
              { key: 'name',        header: 'Name',        width: 140 },
              { key: 'apiKey',      header: 'API key',     width: 160 },
              { key: 'description', header: 'Description' },
            ]}
          />
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntSummaryStat"
        description="Big-number stat tile. variant adds a coloured value; hint adds a small sub-label. Pass onClick to make it a clickable filter — it gets a pointer, hover lift and keyboard focus; pair with active to mark the selected one."
      >
        <Example label="Default">
          <div className="summary-stats-row">
            <SntSummaryStat value="142" label="Trackers" variant="info" />
            <SntSummaryStat value="36"  label="Users"    variant="success" />
            <SntSummaryStat value="3"   label="Alerts"   variant="warning" />
            <SntSummaryStat value="1"   label="Outages"  variant="danger" />
          </div>
        </Example>
        <Example label="With hint (new in 0.5.2)">
          <div className="summary-stats-row">
            <SntSummaryStat
              value="204"
              label="Total devices"
              hint="All devices in this organisation"
              variant="info"
            />
            <SntSummaryStat
              value="187"
              label="Active"
              hint="Reported in last 24h"
              variant="success"
            />
            <SntSummaryStat
              value="12"
              label="Idle"
              hint="No data for 7+ days"
              variant="warning"
            />
            <SntSummaryStat
              value="5"
              label="Offline"
              hint="No data for 30+ days"
              variant="danger"
            />
          </div>
        </Example>
        <Example label="Clickable (onClick) — hover for the affordance, click to select (active state)">
          <div className="summary-stats-row">
            <SntSummaryStat
              value="187"
              label="Active"
              variant="success"
              onClick={() => setStatFilter('active')}
              active={statFilter === 'active'}
            />
            <SntSummaryStat
              value="12"
              label="Idle"
              variant="warning"
              onClick={() => setStatFilter('idle')}
              active={statFilter === 'idle'}
            />
            <SntSummaryStat
              value="5"
              label="Offline"
              variant="danger"
              onClick={() => setStatFilter('offline')}
              active={statFilter === 'offline'}
            />
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntProgressBar"
        description="Inline percentage bar. variant=auto colours by value."
      >
        <Example label="Variants (25 / 60 / 90)">
          <div className="showcase-stack">
            <SntProgressBar value={25} variant="danger"  />
            <SntProgressBar value={60} variant="warning" />
            <SntProgressBar value={90} variant="success" />
          </div>
        </Example>
        <Example label="Auto colour by value">
          <div className="showcase-stack">
            <SntProgressBar value={20} variant="auto" />
            <SntProgressBar value={55} variant="auto" />
            <SntProgressBar value={85} variant="auto" />
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntHistogram"
        description="Microchart showing a distribution. Pass an array of {start, end, count}."
      >
        <SntHistogram buckets={HISTOGRAM_BUCKETS} height={80} />
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntSpinner + SntLoadingOverlay"
        description="Indeterminate loading indicators."
      >
        <Example label="Spinner sizes">
          <div className="showcase-row" style={{ alignItems: 'center' }}>
            <SntSpinner size="small"  />
            <SntSpinner size="medium" />
            <SntSpinner size="large"  />
          </div>
        </Example>
        <Example label="Loading overlay (toggle)">
          <SntButton onClick={() => {
            setShowOverlay(true)
            setTimeout(() => setShowOverlay(false), 1500)
          }}>
            Show overlay for 1.5s
          </SntButton>
          {showOverlay && (
            <div style={{ position: 'relative', height: 120, marginTop: 12 }}>
              <SntLoadingOverlay message="Loading sample data..." />
            </div>
          )}
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntDialog"
        description="Modal dialog. open + onClose are controlled by the caller. Use the footer prop for a native button bar (no more hand-rolled flex rows in the body). Footer action order is always blue (emphasis) → white (secondary) → link (SntLink). Pair fillHeight + scroll='none' with a child that scrolls internally (e.g. SntTable scroll='internal') for table-in-dialog UIs."
      >
        <Example label='footer prop — bordered button bar at the bottom. Default footerAlign="start" (left-aligned).'>
          <SntButton onClick={() => setDialogOpen(true)}>
            Open dialog
          </SntButton>
          <SntDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Example dialog"
            size="small"
            footer={
              <>
                <SntButton variant="emphasis" onClick={() => setDialogOpen(false)}>OK</SntButton>
                <SntButton onClick={() => setDialogOpen(false)}>Cancel</SntButton>
              </>
            }
          >
            <p>This is a small modal dialog. Click the backdrop or × to close.</p>
            <p style={{ color: 'var(--snt-grey)', fontSize: 13, margin: 0 }}>
              Footer buttons live in a dedicated bar below the body — separated by a top border,
              with consistent padding and gap. Default alignment is left.
            </p>
          </SntDialog>
        </Example>

        <Example label='Canonical footer order — blue (emphasis) first, white (secondary) second, link (SntLink) third. Always order overlay actions this way.'>
          <SntButton onClick={() => setDialogLeftAlignOpen(true)}>
            Open dialog
          </SntButton>
          <SntDialog
            open={dialogLeftAlignOpen}
            onClose={() => setDialogLeftAlignOpen(false)}
            title="Delete organisation"
            size="small"
            footer={
              <>
                <SntButton variant="delete" onClick={() => setDialogLeftAlignOpen(false)}>
                  Delete
                </SntButton>
                <SntButton onClick={() => setDialogLeftAlignOpen(false)}>Cancel</SntButton>
                <SntLink onClick={() => setDialogLeftAlignOpen(false)}>Learn more</SntLink>
              </>
            }
          >
            <p>Are you sure you want to delete this organisation? This cannot be undone.</p>
          </SntDialog>
        </Example>

        <Example label='fillHeight + scroll="none" wrapping SntTable scroll="internal" — dialog claims max viewport height; the table body owns the scroll, sticky header stays put, footer pagination sticks to the bottom of the table.'>
          <SntButton onClick={() => setDialogTableOpen(true)}>
            Open table dialog
          </SntButton>
          <SntDialog
            open={dialogTableOpen}
            onClose={() => setDialogTableOpen(false)}
            title="Pick a vehicle"
            size="large"
            scroll="none"
            fillHeight
            footer={
              <>
                <SntButton variant="emphasis" onClick={() => setDialogTableOpen(false)}>
                  Assign
                </SntButton>
                <SntButton onClick={() => setDialogTableOpen(false)}>Cancel</SntButton>
              </>
            }
          >
            <SntTable
              data={DIALOG_TABLE_DATA}
              rowKey="id"
              defaultPageSize={25}
              scroll="internal"
              columns={[
                { key: 'name',     header: 'Name'     },
                { key: 'trackers', header: 'Trackers' },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row, val) => (
                    <SntBadge variant={STATUS_VARIANT[val] || 'secondary'} text={val} />
                  ),
                },
              ]}
            />
          </SntDialog>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntSidepanel + SntFilterSection"
        description="Collapsible filter rail used alongside list views."
      >
        <div className="showcase-sidepanel-demo">
          <SntSidepanel
            title="Filters"
            open={sidepanelOpen}
            onToggle={() => setSidepanelOpen((v) => !v)}
            width={240}
          >
            <SntFilterSection label="Status">
              <SntSwitch checked={activeOnly} onChange={setActiveOnly} label="Active only" />
            </SntFilterSection>
            <SntFilterSection label="Region">
              <SntSelect
                value="eu"
                onChange={() => {}}
                options={[
                  { value: 'eu', label: 'Europe' },
                  { value: 'us', label: 'United States' },
                ]}
              />
            </SntFilterSection>
          </SntSidepanel>
          <div className="showcase-sidepanel-content">
            <p>Sidepanel content area. Toggle the chevron to collapse.</p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntMap"
        description="Leaflet base map with Street/Satellite toggle, geocoder search, and top-right controls (zoom, current location, zoom-to-all). Compose by nesting layer children — SntDeviceLayer, SntGeozoneLayer, SntMarkerClusterLayer, or your own custom Leaflet layer that calls useSntMap() to get the map instance and L."
      >
        <Example label="Devices only — SntDeviceLayer">
          <SntMap
            mapboxKey={config.mapboxKey}
            locationiqKey={config.locationiqKey}
            height="280px"
            center={[50.85, 4.35]}
            zoom={6}
          >
            <SntDeviceLayer devices={DEMO_DEVICES} />
          </SntMap>
        </Example>

        <Example label="Switchable layers — devices + geozones with a toggle chip in the Layers control (bottom-left)">
          <SntMap
            mapboxKey={config.mapboxKey}
            locationiqKey={config.locationiqKey}
            height="280px"
            center={[50.85, 4.35]}
            zoom={6}
          >
            <SntGeozoneLayer geozones={DEMO_GEOZONES} fitBounds={false} />
            <SntDeviceLayer devices={DEMO_DEVICES} fitBounds={false} />
          </SntMap>
        </Example>

        <Example label="Zoom-to-all + current location buttons (new in 0.5.4) — top-right controls let you snap to every device and pan to the user's GPS position">
          <SntMap
            mapboxKey={config.mapboxKey}
            locationiqKey={config.locationiqKey}
            height="280px"
            center={[50.85, 4.35]}
            zoom={6}
            showCurrentLocation
            onZoomToAll={(map) => {
              map.fitBounds(
                DEMO_DEVICES.map((d) => [d.lastLat, d.lastLng]),
                { padding: [40, 40] }
              )
            }}
          >
            <SntDeviceLayer devices={DEMO_DEVICES} fitBounds={false} />
          </SntMap>
        </Example>

        <Example label="Custom heatmap layer — built locally with useSntMap()">
          <SntMap
            mapboxKey={config.mapboxKey}
            locationiqKey={config.locationiqKey}
            height="280px"
            center={[50.85, 4.35]}
            zoom={7}
          >
            <DemoHeatLayer points={HEAT_POINTS} />
          </SntMap>
        </Example>

        <p style={{ color: 'var(--snt-grey)', fontSize: 13, marginTop: 12 }}>
          For the legacy &ldquo;just give me devices + geozones&rdquo; convenience, import <code>SntDeviceMap</code> —
          it&rsquo;s a thin wrapper that composes <code>SntMap</code> + <code>SntGeozoneLayer</code> + <code>SntDeviceLayer</code>.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntColors"
        description="JavaScript colour constants matching the CSS variables."
      >
        <div className="showcase-color-grid">
          {Object.entries(SntColors).map(([name, value]) => (
            <div key={name} className="showcase-color-swatch">
              <div className="showcase-color-chip" style={{ background: value }} />
              <div className="showcase-color-meta">
                <div className="showcase-color-name">{name}</div>
                <div className="showcase-color-value">{value}</div>
              </div>
            </div>
          ))}
        </div>
        <h4 style={{ marginTop: 24 }}>Badge variants (SntBadgeColors)</h4>
        <div className="showcase-color-grid">
          {Object.entries(SntBadgeColors).map(([name, value]) => (
            <div key={name} className="showcase-color-swatch">
              <div className="showcase-color-chip" style={{ background: value }} />
              <div className="showcase-color-meta">
                <div className="showcase-color-name">{name}</div>
                <div className="showcase-color-value">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="Examples"
        description="Two end-to-end page compositions built from the widgets, following the page layout rules. All copy is lorem ipsum."
      >
        <Example label="Example 1 — overview with map + table">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SntPageHeader
              title="Lorem ipsum dolor"
              actions={<SntButton icon={<SntIcon name="export" />}>Export</SntButton>}
            />
            <div className="summary-stats-row">
              <SntSummaryStat value="128" label="Lorem ipsum" variant="info" />
              <SntSummaryStat value="42"  label="Dolor sit"   variant="success" />
              <SntSummaryStat value="7"   label="Amet"        variant="warning" />
            </div>
            <SntMessage variant="danger">
              <strong>Lorem ipsum.</strong> {LOREM}
            </SntMessage>
            <div className="showcase-split">
              <SntMap
                mapboxKey={config.mapboxKey}
                locationiqKey={config.locationiqKey}
                height="280px"
                center={[50.85, 4.35]}
                zoom={6}
              >
                <SntDeviceLayer devices={DEMO_DEVICES} />
              </SntMap>
              <SntTable data={LOREM_TABLE} rowKey="id" scroll="none" columns={LOREM_COLUMNS} />
            </div>
          </div>
        </Example>

        <Example label="Example 2 — dashboard with cards, table, map & filters">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="summary-stats-row">
              <SntSummaryStat
                value="204"
                label="Lorem"
                variant="info"
                hint="Lorem ipsum dolor sit amet"
              />
              <SntSummaryStat
                value="187"
                label="Ipsum (clickable)"
                variant="success"
                onClick={() => setExampleStatActive((v) => !v)}
                active={exampleStatActive}
              />
              <SntSummaryStat
                value="12"
                label="Dolor"
                variant="warning"
                hint="Consectetur adipiscing elit"
              />
              <SntSummaryStat value="5" label="Amet" variant="danger" />
            </div>
            <div className="showcase-equal-row">
              {['Lorem', 'Ipsum', 'Dolor'].map((t) => (
                <SntCard key={t} title={`${t} sit amet`}>
                  <p style={{ marginTop: 0 }}>{LOREM}</p>
                  <SntButton>Lorem ipsum</SntButton>
                </SntCard>
              ))}
            </div>
            <SntTable data={LOREM_TABLE} rowKey="id" scroll="none" columns={LOREM_COLUMNS} />
            <SntMap
              mapboxKey={config.mapboxKey}
              locationiqKey={config.locationiqKey}
              height="280px"
              center={[50.85, 4.35]}
              zoom={6}
            >
              <SntDeviceLayer devices={DEMO_DEVICES} />
            </SntMap>
            <div className="showcase-equal-row">
              {['Lorem', 'Ipsum', 'Dolor', 'Amet'].map((t) => (
                <SntCard key={t} title={t}>
                  <p style={{ margin: 0 }}>{LOREM}</p>
                </SntCard>
              ))}
            </div>
            <SntPageHeader title="Consectetur adipiscing" />
            <SntDateRangePicker
              value={dateRange}
              onChange={setDateRange}
              modes={['day', 'week', 'month', 'custom']}
            />
            <div className="showcase-filter-split">
              <aside className="showcase-filter-panel">
                <SntCheckboxList
                  label="Lorem ipsum"
                  options={['Lorem', 'Ipsum', 'Dolor', 'Amet', 'Consectetur']}
                  selected={exampleChecks}
                  onChange={setExampleChecks}
                />
              </aside>
              <SntTable data={LOREM_TABLE} rowKey="id" scroll="none" columns={LOREM_COLUMNS} />
            </div>
          </div>
        </Example>
      </Section>
      </main>
      </div>
      </div>
    </div>
  )
}
