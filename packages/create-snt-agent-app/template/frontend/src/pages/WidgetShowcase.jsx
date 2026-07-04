import { useState } from 'react'
import {
  SntBadge,
  SntButton,
  SntButtonGroup,
  SntCard,
  SntCheckboxList,
  SntColors,
  SntIcon,
  SNT_ICON_NAMES,
  SntDateRangePicker,
  SntDialog,
  SntGrid,
  SntGridItem,
  SntHistogram,
  SntInput,
  SntLoadingOverlay,
  SntMap,
  SntDeviceLayer,
  SntProgressBar,
  SntSelect,
  SntSidepanel,
  SntFilterSection,
  SntSpinner,
  SntSummaryStat,
  SntSwitch,
  SntTable,
  SntTabs,
  SntTabPanel,
  SntToolbar,
  SntToolbarSpacer,
  getDefaultDateRange,
} from '@sensolus/snt-agent-kit'
import { useAppConfig } from '../AppConfigContext'

function Section({ title, description, children }) {
  return (
    <SntCard title={title}>
      {description && (
        <p style={{ color: 'var(--snt-grey)', marginBottom: 16, fontSize: 14 }}>
          {description}
        </p>
      )}
      <div className="showcase-section-body">{children}</div>
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

export function WidgetShowcase() {
  const config = useAppConfig()
  const [inputValue, setInputValue] = useState('Hello world')
  const [selectValue, setSelectValue] = useState('eu')
  const [groupValue, setGroupValue] = useState('cards')
  const [switchOn, setSwitchOn] = useState(true)
  const [activeOnly, setActiveOnly] = useState(true)
  const [checkboxSelected, setCheckboxSelected] = useState(['Trackers', 'Geozones'])
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange('week'))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [sidepanelOpen, setSidepanelOpen] = useState(true)
  const [showcaseTab, setShowcaseTab] = useState('one')

  return (
    <div className="page-container widget-showcase">
      <SntCard>
        <p style={{ margin: 0, color: 'var(--snt-grey)' }}>
          Live reference of every Sensolus widget shipped with this app. Each card
          shows the widget, what it&apos;s for, and a handful of common configurations.
          Source lives in <code>src/widgets/</code>.
        </p>
      </SntCard>

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
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntBadge"
        description="Compact status / label pill. onChange receives a value, not an event."
      >
        <Example label="Variants">
          <div className="showcase-row">
            {BADGE_VARIANTS.map((v) => (
              <SntBadge key={v} variant={v} text={v} />
            ))}
          </div>
        </Example>
        <Example label="Compact">
          <SntBadge variant="success" text="Active" compact />
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
        description="Multi-select filter with select-all. options is a plain array of strings."
      >
        <Example label="Multi-select">
          <div style={{ maxWidth: 320 }}>
            <SntCheckboxList
              label="Resources"
              options={['Organisations', 'Trackers', 'Users', 'Geozones', 'Alerts']}
              selected={checkboxSelected}
              onChange={setCheckboxSelected}
            />
          </div>
        </Example>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntDateRangePicker"
        description="Range selection with day / week / month / custom modes. Value is { viewMode, start, end } as JS Dates."
      >
        <Example label={`Current: ${dateRange.start.toDateString()} → ${dateRange.end.toDateString()} (${dateRange.viewMode})`}>
          <SntDateRangePicker value={dateRange} onChange={setDateRange} />
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
        description="Sortable, paginated data table. Columns define key, header, optional render."
      >
        <SntTable
          data={TABLE_DATA}
          rowKey="id"
          defaultPageSize={25}
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
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section
        title="SntSummaryStat"
        description="Big-number stat tile. variant adds a coloured value."
      >
        <div className="summary-stats-row">
          <SntSummaryStat value="142" label="Trackers" variant="info" />
          <SntSummaryStat value="36"  label="Users"    variant="success" />
          <SntSummaryStat value="3"   label="Alerts"   variant="warning" />
          <SntSummaryStat value="1"   label="Outages"  variant="danger" />
        </div>
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
        description="Modal dialog. open + onClose are controlled by the caller."
      >
        <SntButton onClick={() => setDialogOpen(true)}>
          Open dialog
        </SntButton>
        <SntDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Example dialog"
          size="small"
        >
          <p>This is a small modal dialog. Click the backdrop or × to close.</p>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <SntButton variant="emphasis" onClick={() => setDialogOpen(false)}>OK</SntButton>
            <SntButton onClick={() => setDialogOpen(false)}>Cancel</SntButton>
          </div>
        </SntDialog>
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
        description="Base Leaflet map (street/satellite toggle, geocoder, zoom/scale). Compose with layer components — here, <SntDeviceLayer>."
      >
        <SntMap
          mapboxKey={config.mapboxKey}
          locationiqKey={config.locationiqKey}
          height="320px"
          center={[50.85, 4.35]}
          zoom={6}
        >
          <SntDeviceLayer
            devices={[
              { id: 'd1', name: 'Demo tracker A', lastLat: 50.8503, lastLng: 4.3517 },
              { id: 'd2', name: 'Demo tracker B', lastLat: 51.2194, lastLng: 4.4025 },
              { id: 'd3', name: 'Demo tracker C', lastLat: 51.0543, lastLng: 3.7174 },
            ]}
          />
        </SntMap>
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
      </Section>
    </div>
  )
}
