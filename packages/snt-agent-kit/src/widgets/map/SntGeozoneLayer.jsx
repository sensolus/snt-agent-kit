/**
 * SntGeozoneLayer — renders Sensolus geozones inside <SntMap>.
 *
 * Props:
 *   geozones      - explicit list; if omitted, fetches via api.fetchGeozones(orgId)
 *   orgId         - fallback fetch source when `geozones` not provided
 *   visible       - initial visibility (default true); user can toggle via the chip
 *   showSelector  - default true; renders a toggle in the map's layer panel
 *   fitBounds     - default true; map zooms to fit geozones on first render
 */
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { useSntMap } from './SntMap'
import { useLayerToggle } from './useLayerToggle'
import { useSntUi } from '../../SntUiProvider'
import { escapeHtml, pointInPolygon } from './mapUtils'
import geozonesIcon from '../../assets/map/Geozones-icons.svg'

export function SntGeozoneLayer({
  geozones: geozonesProp,
  orgId,
  visible = true,
  showSelector = true,
  fitBounds = true,
}) {
  const { map } = useSntMap()
  const { api } = useSntUi()

  const [fetchedGeozones, setFetchedGeozones] = useState([])
  const groupRef = useRef(null)

  // Fetch geozones when no explicit list provided.
  useEffect(() => {
    if (geozonesProp || !orgId) return
    let cancelled = false
    api.fetchGeozones(orgId)
      .then(data => { if (!cancelled) setFetchedGeozones(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setFetchedGeozones([]) })
    return () => { cancelled = true }
  }, [api, orgId, geozonesProp])

  const geozones = geozonesProp || fetchedGeozones

  const layerVisible = useLayerToggle({
    id: 'geozones',
    label: 'Geozones',
    icon: geozonesIcon,
    defaultVisible: visible,
    enabled: showSelector && geozones.length > 0,
  })

  // Render geozones onto the map.
  useEffect(() => {
    if (!map) return

    if (groupRef.current) {
      groupRef.current.clearLayers()
      map.removeLayer(groupRef.current)
      groupRef.current = null
    }

    if (!layerVisible || !geozones.length) return

    const group = L.featureGroup()
    const tooltipAggregated = L.tooltip({ sticky: true, offset: [0, -4] })
    const polygons = []

    const sorted = [...geozones].sort((a, b) => (a.surface > b.surface ? -1 : 1))

    for (const gz of sorted) {
      if (gz.hideOnMap) continue
      let shape = null

      if (gz.circleGeozone) {
        shape = L.circle(
          [gz.circleGeozone.point.x, gz.circleGeozone.point.y],
          {
            color: gz.borderColor || '#0071A1',
            weight: 1,
            fillColor: gz.contentColor || '#A0C3D8',
            fillOpacity: 0.4,
            radius: gz.circleGeozone.radius,
            _name: gz.name,
          }
        )
      } else if (gz.coordinates?.length) {
        const path = gz.coordinates.map(c => [c.x, c.y])
        shape = L.polygon(path, {
          color: gz.borderColor || '#0071A1',
          weight: 1,
          fillColor: gz.contentColor || '#A0C3D8',
          fillOpacity: 0.4,
          _name: gz.name,
        })
      }

      if (shape) {
        shape.on('mousemove', (e) => {
          const latlng = e.latlng
          const overlapping = polygons.filter(p => {
            if (p instanceof L.Circle) return p.getBounds().contains(latlng)
            return pointInPolygon(latlng, p)
          })
          const names = overlapping.map(p => p.options._name)
          tooltipAggregated.setContent(names.map(escapeHtml).join('<br>'))
          tooltipAggregated.setLatLng(latlng)
          if (!map.hasLayer(tooltipAggregated)) group.addLayer(tooltipAggregated)
        })

        shape.on('mouseout', () => {
          if (map.hasLayer(tooltipAggregated)) group.removeLayer(tooltipAggregated)
        })

        polygons.push(shape)
        group.addLayer(shape)
      }
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
  }, [map, geozones, layerVisible, fitBounds])

  return null
}
