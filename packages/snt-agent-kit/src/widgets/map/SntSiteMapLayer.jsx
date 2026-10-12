/**
 * SntSiteMapLayer — renders Sensolus site maps (floor plans, yard layouts, …)
 * inside <SntMap>, toggled as one "Site maps" chip in the Layers control —
 * the same switch the platform's asset map offers.
 *
 * Each site map is an image pinned on the map by its four corners. The
 * corners need not form a rectangle: the image is drawn with a projective
 * transform, so rotated and skewed plans land exactly where they were placed
 * in the platform.
 *
 * Props:
 *   siteMaps      - explicit list (SiteMapExternalDto[] from GET /site-maps);
 *                   if omitted, fetches via api.fetchSiteMaps(orgId)
 *   orgId         - organisation to fetch for; omitted = the API key's own
 *   floor         - only show site maps of this floor (site maps without a
 *                   floor show on every floor). Omit to show all floors.
 *   visible       - initial visibility (default true); user can toggle via the chip
 *   showSelector  - default true; renders a toggle in the map's layer panel
 *   label         - chip caption (default 'Site maps')
 *   fitBounds     - default false; map zooms to fit the site maps on first render
 *
 * Image URLs: `image.downloadUrl` is relative to the platform host. The
 * generated app's /api/site-maps proxy rewrites it to an absolute URL; with a
 * custom backend, return absolute URLs (or proxy the download) yourself.
 */
import { useEffect, useState } from 'react'
import L from 'leaflet'
import { useSntMap } from './SntMap'
import { useLayerToggle } from './useLayerToggle'
import { useSntUi } from '../../SntUiProvider'
import siteMapsIcon from '../../assets/map/site-maps.svg'

// Above the basemap (tilePane, 200), below geozones and markers (overlayPane, 400+).
const SITE_MAP_PANE = 'sntSiteMapPane'
const SITE_MAP_PANE_Z_INDEX = 350

/** GET {downloadUrl}?imageToken={imageToken} — no API key needed. */
export function siteMapImageUrl(image) {
  if (!image?.downloadUrl) return null
  if (!image.imageToken) return image.downloadUrl
  const sep = image.downloadUrl.includes('?') ? '&' : '?'
  return `${image.downloadUrl}${sep}imageToken=${encodeURIComponent(image.imageToken)}`
}

/**
 * Homography taking the image rectangle (0,0)-(w,h) onto the quad
 * tl, tr, br, bl (layer points), as a CSS matrix3d. Heckbert's
 * square-to-quad mapping, pre-scaled by the image size.
 */
function quadTransform(w, h, tl, tr, br, bl) {
  const dx1 = tr.x - br.x, dx2 = bl.x - br.x, dx3 = tl.x - tr.x + br.x - bl.x
  const dy1 = tr.y - br.y, dy2 = bl.y - br.y, dy3 = tl.y - tr.y + br.y - bl.y

  let g = 0
  let k = 0
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const det = dx1 * dy2 - dx2 * dy1
    g = (dx3 * dy2 - dx2 * dy3) / det
    k = (dx1 * dy3 - dx3 * dy1) / det
  }
  const a = tr.x - tl.x + g * tr.x
  const b = bl.x - tl.x + k * bl.x
  const d = tr.y - tl.y + g * tr.y
  const e = bl.y - tl.y + k * bl.y

  // [a/w b/h tl.x; d/w e/h tl.y; g/w k/h 1], column-major for matrix3d.
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, tl.x, tl.y, 0, 1]
  return `matrix3d(${m.join(',')})`
}

function toLatLng(c) {
  return L.latLng(c.lat, c.lng)
}

/** The four corners as LatLngs; a missing bottomRight completes the parallelogram. */
function cornerLatLngs(corners) {
  const { topLeft, topRight, bottomLeft } = corners || {}
  if (!topLeft || !topRight || !bottomLeft) return null
  const bottomRight = corners.bottomRight || {
    lat: topRight.lat + bottomLeft.lat - topLeft.lat,
    lng: topRight.lng + bottomLeft.lng - topLeft.lng,
  }
  return [topLeft, topRight, bottomRight, bottomLeft].map(toLatLng)
}

/** An image drawn onto four arbitrary corners. Mirrors L.ImageOverlay's lifecycle. */
const QuadImageOverlay = L.Layer.extend({
  options: { pane: SITE_MAP_PANE, opacity: 1, alt: '' },

  initialize(url, corners, size, options) {
    L.setOptions(this, options)
    this._url = url
    this._corners = corners // [tl, tr, br, bl]
    this._size = size // { width, height } or null until the image loads
  },

  onAdd() {
    if (!this._image) this._initImage()
    this.getPane().appendChild(this._image)
    this._reset()
  },

  onRemove() {
    L.DomUtil.remove(this._image)
  },

  getEvents() {
    const events = { zoom: this._reset, viewreset: this._reset }
    if (this._zoomAnimated) events.zoomanim = this._animateZoom
    return events
  },

  getBounds() {
    return L.latLngBounds(this._corners)
  },

  _initImage() {
    const img = L.DomUtil.create('img', 'leaflet-image-layer snt-site-map')
    L.DomUtil.addClass(img, this._zoomAnimated ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide')
    img.alt = this.options.alt
    img.draggable = false
    img.style.position = 'absolute'
    img.style.left = '0'
    img.style.top = '0'
    img.style.maxWidth = 'none'
    img.style.transformOrigin = '0 0'
    img.style.pointerEvents = 'none'
    img.style.opacity = this.options.opacity
    img.onselectstart = L.Util.falseFn
    img.onmousemove = L.Util.falseFn
    img.onload = () => {
      if (this._size) return
      this._size = { width: img.naturalWidth, height: img.naturalHeight }
      if (this._map) this._reset()
    }
    img.src = this._url
    this._image = img
  },

  _applyTransform(points) {
    if (!this._size?.width || !this._size?.height) {
      this._image.style.visibility = 'hidden'
      return
    }
    const { width, height } = this._size
    this._image.style.width = `${width}px`
    this._image.style.height = `${height}px`
    this._image.style.visibility = ''
    this._image.style.transform = quadTransform(width, height, ...points)
  },

  _reset() {
    this._applyTransform(this._corners.map(c => this._map.latLngToLayerPoint(c)))
  },

  _animateZoom(e) {
    this._applyTransform(this._corners.map(c => this._map._latLngToNewLayerPoint(c, e.zoom, e.center)))
  },
})

function onFloor(siteMap, floor) {
  if (floor === undefined || floor === null) return true
  return siteMap.floor === undefined || siteMap.floor === null || siteMap.floor === floor
}

export function SntSiteMapLayer({
  siteMaps: siteMapsProp,
  orgId,
  floor,
  visible = true,
  showSelector = true,
  label = 'Site maps',
  fitBounds = false,
}) {
  const { map } = useSntMap()
  const { api } = useSntUi()

  const [fetchedSiteMaps, setFetchedSiteMaps] = useState([])

  // Fetch site maps when no explicit list provided.
  useEffect(() => {
    if (siteMapsProp) return
    let cancelled = false
    api.fetchSiteMaps(orgId)
      .then(data => { if (!cancelled) setFetchedSiteMaps(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setFetchedSiteMaps([]) })
    return () => { cancelled = true }
  }, [api, orgId, siteMapsProp])

  const siteMaps = siteMapsProp || fetchedSiteMaps

  const layerVisible = useLayerToggle({
    id: 'site-maps',
    label,
    icon: siteMapsIcon,
    defaultVisible: visible,
    enabled: showSelector && siteMaps.length > 0,
  })

  // Render site maps onto the map.
  useEffect(() => {
    if (!map || !layerVisible || !siteMaps.length) return

    if (!map.getPane(SITE_MAP_PANE)) {
      map.createPane(SITE_MAP_PANE).style.zIndex = SITE_MAP_PANE_Z_INDEX
    }

    const group = L.featureGroup()
    for (const siteMap of siteMaps) {
      if (!onFloor(siteMap, floor)) continue
      const url = siteMapImageUrl(siteMap.image)
      const corners = cornerLatLngs(siteMap.corners)
      if (!url || !corners) continue
      const { width, height } = siteMap.image
      group.addLayer(new QuadImageOverlay(
        url,
        corners,
        width && height ? { width, height } : null,
        { opacity: siteMap.opacity ?? 1, alt: siteMap.name || '' },
      ))
    }

    group.addTo(map)

    if (fitBounds && group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [30, 30] })
    }

    return () => {
      group.clearLayers()
      if (map.hasLayer(group)) map.removeLayer(group)
    }
  }, [map, siteMaps, floor, layerVisible, fitBounds])

  return null
}
