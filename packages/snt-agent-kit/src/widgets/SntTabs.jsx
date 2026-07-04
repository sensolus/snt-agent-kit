/**
 * SntTabs - Tab navigation component
 *
 * @param {object} props
 * @param {Array} props.tabs - Array of {key, label} tab definitions
 * @param {string} props.activeTab - Currently active tab key
 * @param {function} props.onChange - Callback when tab changes
 * @param {boolean} props.fillHeight - When true, the tab strip and the active panel
 *   stretch to fill the parent's height (flex column with `min-height: 0` cascading
 *   down to the panel). Pair with a parent that has a bounded height. Default: false.
 * @param {React.ReactNode} props.children - Tab content (use SntTabPanel)
 */
export function SntTabs({ tabs, activeTab, onChange, fillHeight = false, children }) {
  return (
    <div className={`snt-tabs ${fillHeight ? 'snt-tabs--fill' : ''}`.trim()}>
      <div className="snt-tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`snt-tab ${activeTab === tab.key ? 'snt-tab-active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="snt-tabs-content">{children}</div>
    </div>
  )
}

/**
 * SntTabPanel - Container for tab content
 *
 * @param {object} props
 * @param {string} props.tabKey - Key matching the tab
 * @param {string} props.activeTab - Currently active tab key
 * @param {React.ReactNode} props.children - Panel content
 */
export function SntTabPanel({ tabKey, activeTab, children }) {
  if (tabKey !== activeTab) return null
  return <div className="snt-tab-panel">{children}</div>
}
