// Route map with MapLibre GL and OpenFreeMap tiles (no key).
// maplibre-gl loads inside an effect, so this file is safe to import on a server.
// If the library, WebGL or the tiles fail, a plain SVG sketch takes its place.
import { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapPoint { name: string; lat: number; lon: number; home?: boolean }

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export default function RouteMap({ points, flightEnds, onStatus }: {
  points: MapPoint[]; flightEnds: boolean; onStatus?: (s: 'live' | 'fallback') => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const key = JSON.stringify(points) + flightEnds

  useEffect(() => {
    if (!box.current || points.length < 2) return
    let off = false
    let loaded = false // style reached: the tile service answered
    let map: { remove: () => void } | undefined
    const give = () => { if (!off && !loaded) { setFailed(true); onStatus?.('fallback') } }
    const timer = setTimeout(give, 12000)
    setFailed(false)

    import('maplibre-gl').then((mod) => {
      const ml = mod.default
      if (off || !box.current) return
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0f766e'
      const lons = points.map((p) => p.lon)
      const lats = points.map((p) => p.lat)
      const m = new ml.Map({
        container: box.current,
        style: STYLE,
        bounds: [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
        fitBoundsOptions: { padding: 48, maxZoom: 9 },
        attributionControl: { compact: true },
        cooperativeGestures: true,
      })
      map = m
      m.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right')
      // A single tile or sprite error is not fatal. Only fall back if the map never loads (see timer).
      m.on('error', (e) => console.warn('[RouteMap]', e.error?.message ?? e))
      // 'load' waits for animation frames, which a background tab pauses. The style
      // arriving is enough proof that the map works, so stop the fallback timer here.
      m.once('styledata', () => {
        loaded = true
        clearTimeout(timer)
        onStatus?.('live')
      })
      m.on('load', () => {
        const seg = (a: MapPoint, b: MapPoint) => [[a.lon, a.lat], [b.lon, b.lat]]
        const legs = points.slice(1).map((p, i) => ({ coords: seg(points[i], p), flight: flightEnds && (i === 0 || i === points.length - 2) }))
        const feature = (flight: boolean) => ({
          type: 'Feature' as const, properties: {},
          geometry: { type: 'MultiLineString' as const, coordinates: legs.filter((l) => l.flight === flight).map((l) => l.coords) },
        })
        m.addSource('ground', { type: 'geojson', data: feature(false) })
        m.addSource('flight', { type: 'geojson', data: feature(true) })
        m.addLayer({ id: 'ground', type: 'line', source: 'ground', paint: { 'line-color': accent, 'line-width': 3 } })
        m.addLayer({ id: 'flight', type: 'line', source: 'flight', paint: { 'line-color': accent, 'line-width': 2, 'line-dasharray': [2, 2] } })
        let n = 0
        const done = new Set<string>()
        for (const p of points) {
          const k = `${p.lat},${p.lon}`
          if (done.has(k)) continue
          done.add(k)
          const el = document.createElement('div')
          el.className = 'map-pin' + (p.home ? ' home' : '')
          el.textContent = p.home ? '⌂' : String(++n)
          el.title = p.name
          el.setAttribute('aria-label', p.name)
          new ml.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(new ml.Popup({ offset: 14, closeButton: false }).setText(p.name)).addTo(m)
        }
      })
    }).catch(give)

    return () => { off = true; clearTimeout(timer); map?.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (failed) return <RouteSketch points={points} />
  return <div ref={box} className="route-map" role="img" aria-label={'Map of the route: ' + points.map((p) => p.name).join(', ')} />
}

/** Fallback: a flat sketch of the route, no tiles. */
function RouteSketch({ points }: { points: MapPoint[] }) {
  const W = 600, H = 300, pad = 40
  const lons = points.map((p) => p.lon), lats = points.map((p) => p.lat)
  const x0 = Math.min(...lons), x1 = Math.max(...lons), y0 = Math.min(...lats), y1 = Math.max(...lats)
  const sx = (W - 2 * pad) / Math.max(x1 - x0, 0.01), sy = (H - 2 * pad) / Math.max(y1 - y0, 0.01)
  const s = Math.min(sx, sy)
  const px = (p: MapPoint) => pad + (p.lon - x0) * s + ((W - 2 * pad) - (x1 - x0) * s) / 2
  const py = (p: MapPoint) => H - pad - (p.lat - y0) * s - ((H - 2 * pad) - (y1 - y0) * s) / 2
  const seen = new Set<string>()
  return (
    <figure className="route-sketch">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={'Route sketch: ' + points.map((p) => p.name).join(', ')}>
        <polyline points={points.map((p) => `${px(p)},${py(p)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" />
        {points.filter((p) => { const k = p.name; if (seen.has(k)) return false; seen.add(k); return true }).map((p) => (
          <g key={p.name}>
            <circle cx={px(p)} cy={py(p)} r={p.home ? 7 : 5} fill={p.home ? 'var(--surface)' : 'var(--accent)'} stroke="var(--accent)" strokeWidth="2" />
            <text x={px(p) + 9} y={py(p) - 8} fontSize="13" fill="var(--text)">{p.name}</text>
          </g>
        ))}
      </svg>
      <figcaption className="muted">Map tiles did not load. This is a simple sketch of the route.</figcaption>
    </figure>
  )
}
