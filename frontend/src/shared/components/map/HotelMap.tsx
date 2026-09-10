import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'

import type { Hotel } from '@/shared/api/types'
import { CapacityMeter } from '@/shared/components/CapacityMeter'
import { cn } from '@/shared/utils/cn'

import { brandMarker, brandMarkerActive, COLOMBIA_CENTER, OSM_ATTRIBUTION, OSM_TILES } from './leaflet'
import { ResizeGuard } from './ResizeGuard'

interface HotelMapProps {
  hotels: Hotel[]
  /** Hotel a resaltar; su marcador cambia de color y el mapa lo centra. */
  activeId?: number | null
  onSelect?: (hotel: Hotel) => void
  className?: string
  /** Sin controles ni interacción; para miniaturas. */
  static?: boolean
}

/**
 * Mapa con la ubicación de uno o varios hoteles.
 *
 * Los hoteles sin coordenadas simplemente no se dibujan: un marcador en un
 * punto inventado sería peor que ninguno.
 */
export function HotelMap({ hotels, activeId = null, onSelect, className, static: isStatic = false }: HotelMapProps) {
  const located = hotels.filter((h): h is Hotel & { location: NonNullable<Hotel['location']> } => h.location !== null)

  return (
    <MapContainer
      center={COLOMBIA_CENTER}
      zoom={5}
      scrollWheelZoom={!isStatic}
      dragging={!isStatic}
      zoomControl={!isStatic}
      doubleClickZoom={!isStatic}
      attributionControl={!isStatic}
      className={cn('h-full w-full', className)}
    >
      <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
      <ResizeGuard />

      <FitToMarkers points={located.map((h) => [h.location.latitude, h.location.longitude])} activeId={activeId} hotels={located} />

      {located.map((hotel) => (
        <Marker
          key={hotel.id}
          position={[hotel.location.latitude, hotel.location.longitude]}
          icon={hotel.id === activeId ? brandMarkerActive : brandMarker}
          eventHandlers={onSelect ? { click: () => onSelect(hotel) } : undefined}
        >
          {!isStatic && (
            <Popup>
              <div className="min-w-48 space-y-2">
                <div>
                  <p className="font-semibold text-ink">{hotel.name}</p>
                  <p className="text-xs text-ink-2">{hotel.address}</p>
                </div>
                <CapacityMeter occupied={hotel.occupied_rooms} max={hotel.max_rooms} />
                <Link to={`/app/hoteles/${hotel.id}`} className="text-xs font-medium text-accent hover:underline">
                  Ver habitaciones →
                </Link>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  )
}

/**
 * Encuadra el mapa sobre los marcadores.
 *
 * Con un solo hotel centra sobre él; con varios ajusta el zoom para que todos
 * queden a la vista. Si hay un hotel activo, el mapa se desplaza hasta él sin
 * perder el nivel de zoom, para no desorientar.
 */
function FitToMarkers({
  points,
  activeId,
  hotels,
}: {
  points: Array<[number, number]>
  activeId: number | null
  hotels: Array<Hotel & { location: NonNullable<Hotel['location']> }>
}) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return

    if (points.length === 1) {
      map.setView(points[0], 13, { animate: false })
      return
    }

    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12, animate: false })
    // Se encuadra sólo al cambiar el conjunto de puntos, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points.length])

  useEffect(() => {
    if (activeId === null) return
    const active = hotels.find((h) => h.id === activeId)
    if (active) {
      map.flyTo([active.location.latitude, active.location.longitude], Math.max(map.getZoom(), 12), { duration: 0.6 })
    }
  }, [map, activeId, hotels])

  return null
}
