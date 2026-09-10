import { BedDouble, Building2, DoorOpen, Gauge, MapPin, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/features/auth/authContext'
import { useHotels } from '@/features/hotels/hooks/useHotels'
import type { Hotel } from '@/shared/api/types'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { CapacityMeter } from '@/shared/components/CapacityMeter'
import { MetricCard } from '@/shared/components/MetricCard'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/States'
import { HotelMap } from '@/shared/components/map/HotelMap'
import { toErrorMessage } from '@/shared/hooks/useServerErrors'

/**
 * Panel de inicio: una lectura rápida del estado de la operación.
 *
 * Las cifras se calculan en el cliente a partir del listado completo. Con el
 * volumen de una cadena hotelera —decenas de sedes, no millones— es más
 * sencillo y más honesto que un endpoint de agregados que habría que mantener
 * sincronizado con las mismas reglas.
 */
/** Referencia estable para cuando aún no hay datos; evita rehacer los cálculos en cada render. */
const NO_HOTELS: Hotel[] = []

export function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useHotels({ per_page: 100, sort_by: 'name' })

  const hotels = data?.items ?? NO_HOTELS

  const stats = useMemo(() => {
    const totalRooms = hotels.reduce((n, h) => n + h.max_rooms, 0)
    const occupied = hotels.reduce((n, h) => n + h.occupied_rooms, 0)
    const available = totalRooms - occupied
    const full = hotels.filter((h) => h.available_rooms === 0).length
    const unconfigured = hotels.filter((h) => h.occupied_rooms === 0).length
    const located = hotels.filter((h) => h.location !== null).length

    return {
      totalRooms,
      occupied,
      available,
      full,
      unconfigured,
      located,
      percent: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
    }
  }, [hotels])

  const greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  })()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.name.split(' ')[0] ?? ''}`}
        description="Estado de la configuración de habitaciones en todas las sedes."
        actions={
          <Link to="/app/hoteles?nuevo=1">
            <Button icon={<Plus />}>Registrar hotel</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Hoteles" value={hotels.length} hint={`${stats.located} con ubicación en el mapa`} icon={Building2} isLoading={isLoading} />
        <MetricCard label="Habitaciones" value={stats.totalRooms.toLocaleString('es-CO')} hint="capacidad total declarada" icon={BedDouble} isLoading={isLoading} />
        <MetricCard
          label="Configuradas"
          value={`${stats.percent}%`}
          hint={`${stats.occupied.toLocaleString('es-CO')} de ${stats.totalRooms.toLocaleString('es-CO')}`}
          icon={Gauge}
          tone={stats.percent >= 85 ? 'warning' : 'success'}
          isLoading={isLoading}
        />
        <MetricCard
          label="Disponibles"
          value={stats.available.toLocaleString('es-CO')}
          hint={stats.unconfigured > 0 ? `${stats.unconfigured} ${stats.unconfigured === 1 ? 'hotel sin configurar' : 'hoteles sin configurar'}` : 'todas las sedes con configuración'}
          icon={DoorOpen}
          tone={stats.available === 0 ? 'danger' : 'brand'}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card xl:col-span-3 animate-fade-up" aria-labelledby="occupancy-title">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 id="occupancy-title" className="font-semibold text-ink">Ocupación por sede</h2>
              <p className="text-sm text-ink-2">Habitaciones configuradas sobre el máximo de cada hotel.</p>
            </div>
            <Link to="/app/hoteles" className="text-sm font-medium text-accent hover:underline">
              Ver todos
            </Link>
          </header>

          {isLoading ? (
            <LoadingState rows={4} />
          ) : isError ? (
            <ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} />
          ) : hotels.length === 0 ? (
            <EmptyState icon={Building2} title="Aún no hay hoteles" description="Registre el primero para empezar a configurar habitaciones." />
          ) : (
            <ul className="divide-y divide-line">
              {hotels.map((hotel) => (
                <OccupancyRow key={hotel.id} hotel={hotel} />
              ))}
            </ul>
          )}
        </section>

        <section className="card flex flex-col overflow-hidden xl:col-span-2 animate-fade-up" aria-labelledby="map-title">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 id="map-title" className="font-semibold text-ink">Sedes en el mapa</h2>
              <p className="text-sm text-ink-2">{stats.located} de {hotels.length} ubicadas</p>
            </div>
            <Link to="/app/mapa" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              <MapPin className="size-4" aria-hidden="true" />
              Ampliar
            </Link>
          </header>
          <div className="min-h-72 flex-1">
            {!isLoading && <HotelMap hotels={hotels} className="rounded-none" />}
          </div>
        </section>
      </div>
    </div>
  )
}

function OccupancyRow({ hotel }: { hotel: Hotel }) {
  const isFull = hotel.available_rooms === 0
  const isEmpty = hotel.occupied_rooms === 0

  return (
    <li>
      <Link
        to={`/app/hoteles/${hotel.id}`}
        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-ink">{hotel.name}</p>
            {isFull && <Badge tone="danger" dot>Completo</Badge>}
            {isEmpty && <Badge tone="neutral" dot>Sin configurar</Badge>}
          </div>
          <p className="truncate text-xs text-ink-3">{hotel.city?.name ?? '—'} · {hotel.address}</p>
        </div>
        <CapacityMeter occupied={hotel.occupied_rooms} max={hotel.max_rooms} compact />
      </Link>
    </li>
  )
}
