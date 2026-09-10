import type { Marker as LeafletMarker } from 'leaflet'
import { LocateFixed, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

import type { GeoPoint } from '@/shared/api/types'
import { Button } from '@/shared/components/Button'

import { brandMarker, COLOMBIA_CENTER, OSM_ATTRIBUTION, OSM_TILES } from './leaflet'
import { ResizeGuard } from './ResizeGuard'

interface MapPickerProps {
  value: GeoPoint | null
  onChange: (point: GeoPoint | null) => void
  /** Dirección y ciudad escritas en el formulario, para buscarlas en el mapa. */
  addressQuery?: string
}

/**
 * Selector de ubicación sobre el mapa.
 *
 * Dos formas de situar el hotel: pulsar sobre el mapa, o escribir la dirección
 * y pedir que la busque. La búsqueda usa Nominatim, el geocodificador de
 * OpenStreetMap, que no exige clave. Sus condiciones de uso piden un
 * `User-Agent` identificable y no más de una petición por segundo; ambas se
 * respetan, y la búsqueda es manual —un botón— en lugar de dispararse al
 * escribir, que la superaría con facilidad.
 *
 * La geocodificación de direcciones colombianas no siempre acierta el número
 * exacto; por eso el marcador siempre puede arrastrarse después para afinar.
 */
export function MapPicker({ value, onChange, addressQuery }: MapPickerProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)

  const search = async () => {
    if (!addressQuery?.trim()) {
      setSearchMessage('Escriba primero la dirección y elija la ciudad.')
      return
    }

    setIsSearching(true)
    setSearchMessage(null)

    try {
      const params = new URLSearchParams({
        q: `${addressQuery}, Colombia`,
        format: 'json',
        limit: '1',
        countrycodes: 'co',
      })

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { Accept: 'application/json', 'Accept-Language': 'es' },
      })

      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>

      if (results.length === 0) {
        setSearchMessage('No se encontró la dirección. Sitúe el marcador pulsando sobre el mapa.')
        return
      }

      onChange({ latitude: Number(results[0].lat), longitude: Number(results[0].lon) })
      setSearchMessage(`Ubicado en: ${results[0].display_name}`)
    } catch {
      setSearchMessage('No se pudo consultar el servicio de mapas. Pulse sobre el mapa para situar el hotel.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={search} isLoading={isSearching} icon={<Search />}>
          Buscar dirección en el mapa
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Quitar ubicación
          </Button>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-xs text-ink-3">
          <LocateFixed className="size-3.5" aria-hidden="true" />
          {value ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}` : 'Sin ubicación'}
        </span>
      </div>

      <div className="h-64 overflow-hidden rounded-xl ring-1 ring-line">
        <MapContainer
          center={value ? [value.latitude, value.longitude] : COLOMBIA_CENTER}
          zoom={value ? 14 : 5}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
          <ResizeGuard />
          <ClickToPlace onPlace={onChange} />
          <RecenterOn point={value} />
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              icon={brandMarker}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = (e.target as LeafletMarker).getLatLng()
                  onChange({ latitude: lat, longitude: lng })
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-[0.8125rem] text-ink-3">
        {searchMessage ?? 'Pulse sobre el mapa para situar el hotel, o arrastre el marcador para afinar.'}
      </p>
    </div>
  )
}

function ClickToPlace({ onPlace }: { onPlace: (p: GeoPoint) => void }) {
  useMapEvents({
    click: (e) => onPlace({ latitude: e.latlng.lat, longitude: e.latlng.lng }),
  })
  return null
}

/** Desplaza el mapa cuando la ubicación cambia desde fuera (búsqueda). */
function RecenterOn({ point }: { point: GeoPoint | null }) {
  const map = useMap()

  useEffect(() => {
    if (point) map.flyTo([point.latitude, point.longitude], Math.max(map.getZoom(), 14), { duration: 0.5 })
  }, [map, point?.latitude, point?.longitude]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
