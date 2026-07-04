/**
 * SntDeviceLayer — renders Sensolus device markers inside <SntMap>.
 *
 * Builds on <SntMarkerClusterLayer> with Sensolus defaults:
 *  - blue SVG pin icon
 *  - popup with device name/serial + lastAddress
 *  - permanent label tooltip with device name
 *
 * Props:
 *   devices         - TrackerMetadata-shaped objects (need lastLat / lastLng)
 *   visible         - default true
 *   fitBounds       - default true
 *   cluster         - default true (set false to render plain markers)
 *   renderPopup     - (device) => string | ReactNode override
 *   getMarkerIcon   - (device) => L.Icon override
 */
import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import { useSntMap } from './SntMap'
import { SntMarkerClusterLayer } from './SntMarkerClusterLayer'
import { escapeHtml } from './mapUtils'

// Canonical Sensolus asset marker (matches the platform's SvgIcon). The body
// (#asset-bg-normal) is filled by state colour; #asset-icon holds a white glyph;
// the motion dot / alert bell show only when requested. Rendered 48×55, viewBox
// "0 8 48 48", tail anchored at [23, 43].
const DEVICE_STATE_COLORS = {
  ONLINE: { bg: '#212851', icon: '#FFFFFF' },
  OFFLINE: { bg: '#B8BFCA', icon: '#FFFFFF' },
}

const ALERT_COLORS = { REMINDER: '#0071A1', WARNING: '#FFCC66', CRITICAL: '#E00000' }

function deviceMarkerSvg({ bg, icon, moving, alertSeverity, network }) {
  const alertColor = ALERT_COLORS[alertSeverity] || ALERT_COLORS.WARNING
  return `<svg width="48" height="55" viewBox="0 8 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse id="asset-bg-network" visibility="${network ? 'visible' : 'hidden'}" cx="24" cy="48" rx="12.571" ry="2.286" fill="#00A6ED"/>
  <path id="asset-bg-normal" d="M12.571 18.286C11.9806 18.286 11.5 18.7666 11.5 19.357V42.357C11.5 42.9474 11.9806 43.428 12.571 43.428H21.714L24 48L26.286 43.428H35.429C36.0194 43.428 36.5 42.9474 36.5 42.357V19.357C36.5 18.7666 36.0194 18.286 35.429 18.286H12.571Z" fill="${bg}"/>
  <circle id="asset-icon" cx="24" cy="30.857" r="6" fill="${icon}"/>
  <g id="motion" visibility="${moving ? 'visible' : 'hidden'}">
    <circle cx="36.5" cy="20.571" r="6.286" fill="#39CB99"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M38.857 20.5714L35.429 22.8574V18.5714L38.857 20.5714Z" fill="white"/>
  </g>
  <g id="alert" visibility="${alertSeverity ? 'visible' : 'hidden'}">
    <path d="M12.114 14.571C12.114 14.1143 11.7714 13.714 11.5 13.714C11.2286 13.714 10.886 14.1143 10.886 14.571V15.5429C9.0857 15.9714 7.1 18.2286 7.1 21.3714V24.6286L6.257 25.4286H16.743L15.9 24.6286V21.3714C15.9 18.2286 13.9143 15.9714 12.114 15.5429V14.571ZM11.5 27.0286C12.3714 27.0286 12.814 26.3714 12.814 25.7143H10.186C10.186 26.3714 10.6286 27.0286 11.5 27.0286Z" fill="${alertColor}"/>
  </g>
</svg>`
}

/**
 * Build a Leaflet divIcon for a Sensolus asset marker.
 * @param {object} opts
 * @param {'ONLINE'|'OFFLINE'} opts.state - colour preset (default ONLINE)
 * @param {string} opts.bgColor - override body colour
 * @param {string} opts.iconColor - override glyph colour
 * @param {boolean} opts.moving - show the green motion indicator
 * @param {'REMINDER'|'WARNING'|'CRITICAL'} opts.alertSeverity - show the alert bell
 * @param {boolean} opts.network - show the network base shadow
 */
export function createDeviceIcon({
  state = 'ONLINE',
  bgColor,
  iconColor,
  moving = false,
  alertSeverity,
  network = false,
} = {}) {
  const preset = DEVICE_STATE_COLORS[state] || DEVICE_STATE_COLORS.ONLINE
  return L.divIcon({
    html: deviceMarkerSvg({
      bg: bgColor || preset.bg,
      icon: iconColor || preset.icon,
      moving,
      alertSeverity,
      network,
    }),
    className: 'snt-device-marker',
    iconSize: [48, 55],
    iconAnchor: [23, 43],
    popupAnchor: [0, -40],
  })
}

const defaultDeviceIcon = createDeviceIcon()

// Map a device's shape to marker options, tolerating absent fields (renders
// ONLINE when nothing indicates otherwise).
function defaultDeviceMarkerIcon(device) {
  const offline =
    device.online === false ||
    device.offline === true ||
    device.connectionState === 'OFFLINE' ||
    device.state === 'OFFLINE'
  const moving = device.activityState === 'moving' || device.moving === true
  if (!offline && !moving && !device.alertSeverity) return defaultDeviceIcon
  return createDeviceIcon({
    state: offline ? 'OFFLINE' : 'ONLINE',
    moving,
    alertSeverity: device.alertSeverity,
  })
}

const defaultLabel = (device) => device.name || device.serial || 'Device'

const defaultPopup = (device) => {
  const label = defaultLabel(device)
  return `<strong>${escapeHtml(label)}</strong>${device.lastAddress ? `<br>${escapeHtml(device.lastAddress)}` : ''}`
}

export function SntDeviceLayer({
  devices,
  visible = true,
  fitBounds = true,
  cluster = true,
  renderPopup = defaultPopup,
  getMarkerIcon = defaultDeviceMarkerIcon,
}) {
  const positioned = useMemo(
    () => (devices || []).filter(d => d.lastLat != null && d.lastLng != null),
    [devices]
  )

  if (cluster) {
    return (
      <SntMarkerClusterLayer
        items={positioned}
        visible={visible}
        fitBounds={fitBounds}
        getPosition={d => [d.lastLat, d.lastLng]}
        getMarkerIcon={getMarkerIcon}
        renderPopup={renderPopup}
        renderTooltip={d => escapeHtml(defaultLabel(d))}
        tooltipOffset={[0, -25]}
      />
    )
  }

  return (
    <PlainDeviceLayer
      devices={positioned}
      visible={visible}
      fitBounds={fitBounds}
      renderPopup={renderPopup}
      getMarkerIcon={getMarkerIcon}
    />
  )
}

function PlainDeviceLayer({ devices, visible, fitBounds, renderPopup, getMarkerIcon }) {
  const { map } = useSntMap()
  const groupRef = useRef(null)

  useEffect(() => {
    if (!map) return

    if (groupRef.current) {
      groupRef.current.clearLayers()
      map.removeLayer(groupRef.current)
      groupRef.current = null
    }

    if (!visible || !devices.length) return

    const group = L.featureGroup()
    for (const device of devices) {
      const marker = L.marker([device.lastLat, device.lastLng], { icon: getMarkerIcon(device) })
      marker.bindPopup(renderPopup(device))
      marker.bindTooltip(escapeHtml(defaultLabel(device)), {
        permanent: true,
        direction: 'top',
        offset: [0, -25],
        className: 'snt-device-label',
      })
      group.addLayer(marker)
    }

    group.addTo(map)
    groupRef.current = group

    if (fitBounds && group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [30, 30] })
    }

    return () => {
      group.clearLayers()
      if (map.hasLayer(group)) map.removeLayer(group)
      if (groupRef.current === group) groupRef.current = null
    }
  }, [map, devices, visible, fitBounds, renderPopup, getMarkerIcon])

  return null
}
