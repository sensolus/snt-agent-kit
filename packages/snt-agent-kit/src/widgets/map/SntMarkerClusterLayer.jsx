/**
 * SntMarkerClusterLayer — generic clustered marker layer for <SntMap>.
 *
 * The workhorse for any "show a bunch of dots with clustering" need: caller
 * supplies position + icon + (optional) popup; the layer handles clustering.
 *
 * Props:
 *   items              - any[]; the layer doesn't care about shape
 *   getPosition        - (item) => [lat, lng]
 *   getMarkerIcon      - (item) => L.Icon | L.DivIcon
 *   renderPopup        - (item) => string | ReactNode  (HTML string)
 *   getClusterIcon     - (count) => L.DivIcon (default: sensible bubble)
 *   visible            - default true
 *   fitBounds          - default false
 *   spiderfyOnMaxZoom  - default true
 *   maxClusterRadius   - default 40
 *   renderTooltip      - (item) => string  (optional permanent label)
 */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useSntMap } from './SntMap'
import mapGroupIcon from '../../assets/map/map-group.png'

function defaultClusterIcon(count) {
  let w = 30, h = 30
  if (count >= 10 && count < 100) { w = 34; h = 34 }
  else if (count >= 100 && count < 1000) { w = 40; h = 40 }
  else if (count >= 1000) { w = 48; h = 48 }

  const html = `<img width="${w}" height="${h}" src="${mapGroupIcon}" />`
    + `<div class="snt-cluster" style="line-height:${h}px;">${count}</div>`
  return L.divIcon({ html, className: '', iconSize: L.point(w, h) })
}

export function SntMarkerClusterLayer({
  items,
  getPosition,
  getMarkerIcon,
  renderPopup,
  getClusterIcon,
  visible = true,
  fitBounds = false,
  spiderfyOnMaxZoom = true,
  maxClusterRadius = 40,
  renderTooltip,
  tooltipOffset = [0, -32],
}) {
  const { map } = useSntMap()
  const clusterRef = useRef(null)

  useEffect(() => {
    if (!map) return

    if (clusterRef.current) {
      clusterRef.current.clearLayers()
      map.removeLayer(clusterRef.current)
      clusterRef.current = null
    }

    if (!visible || !items?.length) return

    const cluster = L.markerClusterGroup({
      spiderfyOnMaxZoom,
      showCoverageOnHover: false,
      maxClusterRadius,
      iconCreateFunction(clusterObj) {
        const count = clusterObj.getAllChildMarkers().length
        return (getClusterIcon || defaultClusterIcon)(count)
      },
    })

    for (const item of items) {
      const pos = getPosition(item)
      if (!pos || pos[0] == null || pos[1] == null) continue

      const marker = L.marker(pos, { icon: getMarkerIcon(item) })
      if (renderPopup) marker.bindPopup(renderPopup(item))
      if (renderTooltip) {
        marker.bindTooltip(renderTooltip(item), {
          permanent: true,
          direction: 'top',
          offset: tooltipOffset,
          className: 'snt-device-label',
        })
      }
      cluster.addLayer(marker)
    }

    cluster.addTo(map)
    clusterRef.current = cluster

    if (fitBounds && cluster.getLayers().length > 0) {
      map.fitBounds(cluster.getBounds(), { padding: [30, 30] })
    }

    return () => {
      cluster.clearLayers()
      if (map.hasLayer(cluster)) map.removeLayer(cluster)
      if (clusterRef.current === cluster) clusterRef.current = null
    }
  }, [
    map,
    items,
    visible,
    fitBounds,
    spiderfyOnMaxZoom,
    maxClusterRadius,
    getPosition,
    getMarkerIcon,
    renderPopup,
    getClusterIcon,
    renderTooltip,
    tooltipOffset,
  ])

  return null
}
