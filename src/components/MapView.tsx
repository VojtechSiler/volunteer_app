import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import type { Opportunity } from '../types'
import { PROGRAMME_META, formatSalary } from '../lib/format'
import { useI18n } from '../lib/i18n'
import { Flag } from './Flag'

function pinIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div class="pin" style="background:${color}"><span>${''}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  })
}

const ICONS: Record<string, L.DivIcon> = {
  'global-volunteer': pinIcon('var(--fit)'),
  'global-talent': pinIcon('var(--primary)'),
  'global-teacher': pinIcon('var(--coral)'),
}

function FitBounds({ opps }: { opps: Opportunity[] }) {
  const map = useMap()
  useEffect(() => {
    if (!opps.length) return
    const bounds = L.latLngBounds(
      opps.map((o) => [o.location.lat, o.location.lng] as [number, number]),
    )
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 })
  }, [opps, map])
  return null
}

export function MapView({ opps }: { opps: Opportunity[] }) {
  const { t } = useI18n()
  return (
    <div className="h-[calc(100vh-13rem)] min-h-[460px] overflow-hidden rounded-2xl border border-border shadow-card">
      <MapContainer
        center={[20, 20]}
        zoom={2}
        scrollWheelZoom
        className="h-full w-full"
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FitBounds opps={opps} />
        {opps.map((o) => (
          <Marker
            key={o.id}
            position={[o.location.lat, o.location.lng]}
            icon={ICONS[o.programme]}
          >
            <Popup>
              <div className="w-56">
                <div
                  className="mb-1 text-[11px] font-bold uppercase tracking-wide"
                  style={{ color: PROGRAMME_META[o.programme].color }}
                >
                  {PROGRAMME_META[o.programme].label}
                </div>
                <div className="font-display text-sm font-bold leading-snug text-ink">
                  {o.title}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <Flag code={o.location.countryCode} />
                  <span>{o.location.city}, {o.location.country}</span>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {o.duration} · {formatSalary(o.salary, t)}
                </div>
                <Link
                  to={`/opportunities/${o.id}`}
                  className="mt-2 inline-block text-xs font-bold text-primary hover:underline"
                >
                  {t('card.viewDetails')}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
