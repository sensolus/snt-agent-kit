/**
 * Shared helpers used by SntMap and its layer components.
 */
import L from 'leaflet'

/** Escape HTML to prevent XSS when injecting into Leaflet popups/tooltips. */
export function escapeHtml(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/** Ray-casting point-in-polygon test for L.Polygon (incl. multi-ring). */
export function pointInPolygon(latlng, polygon) {
  const x = latlng.lat
  const y = latlng.lng
  let inside = false

  for (const ring of polygon.getLatLngs()) {
    const pts = Array.isArray(ring[0]) ? ring : [ring]
    for (const polyPoints of pts) {
      for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        const xi = polyPoints[i].lat, yi = polyPoints[i].lng
        const xj = polyPoints[j].lat, yj = polyPoints[j].lng
        const intersect = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
        if (intersect) inside = !inside
      }
    }
  }
  return inside
}

/**
 * Build a leaflet-control-geocoder adapter that delegates to the provider's geocode().
 * Supports direct "lat,lng" input as a shortcut.
 */
export function makeGeocoderAdapter(geocode) {
  const transform = (results) =>
    (results || [])
      .filter(loc => loc.boundingbox)
      .map(loc => ({
        name: loc.name,
        bbox: L.latLngBounds(
          L.latLng(loc.boundingbox[0], loc.boundingbox[2]),
          L.latLng(loc.boundingbox[1], loc.boundingbox[3])
        ),
        center: L.latLng(loc.lat, loc.lng),
      }))

  return {
    async geocode(query) {
      const parts = query.split(',')
      if (parts.length === 2) {
        const lat = Number(parts[0].trim())
        const lng = Number(parts[1].trim())
        if (isFinite(lat) && Math.abs(lat) <= 90 && isFinite(lng) && Math.abs(lng) <= 180) {
          const latLng = L.latLng(lat, lng)
          return [{ name: query, bbox: L.latLngBounds(latLng, latLng), center: latLng }]
        }
      }
      return transform(await geocode(query))
    },
    async suggest(query) {
      return this.geocode(query)
    },
  }
}
