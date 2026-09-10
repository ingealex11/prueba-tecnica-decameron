import { Building2, MapPinOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useHotels } from '@/features/hotels/hooks/useHotels'
import { Badge } from '@/shared/components/Badge'
import { CapacityMeter } from '@/shared/components/CapacityMeter'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState, LoadingState } from '@/shared/components/States'
import { HotelMap } from '@/shared/components/map/HotelMap'
import { toErrorMessage } from '@/shared/hooks/useServerErrors'
import { cn } from '@/shared/utils/cn'

/**
 * Mapa de todas las sedes con su lista al lado.
 *
 * Seleccionar en la lista centra el mapa; seleccionar en el mapa resalta en la
 * lista. Los hoteles sin ubicación aparecen al final, marcados, para que se
 * note qué falta por situar.
 */
export function MapPage() {
  const { data, isLoading, isError, error, refetch } = useHotels({ per_page: 100, sort_by: 'name' })
  const [activeId, setActiveId] = useState<number | null>(null)

  const hotels = data?.items ?? []
  const located = hotels.filter((h) => h.location !== null)
  const unlocated = hotels.filter((h) => h.location === null)

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[32rem] flex-col gap-6">
      <PageHeader
        title="Mapa de sedes"
        description={`${located.length} de ${hotels.length} hoteles con ubicación registrada.`}
      />

      {isLoading ? (
        <div className="card flex-1"><LoadingState rows={5} /></div>
      ) : isError ? (
        <div className="card flex-1"><ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} /></div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[22rem_1fr]">
          <aside className="card flex min-h-0 flex-col overflow-hidden animate-fade-up">
            <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
              {[...located, ...unlocated].map((hotel) => {
                const isActive = hotel.id === activeId
                const hasLocation = hotel.location !== null

                return (
                  <li key={hotel.id}>
                    <button
                      type="button"
                      onClick={() => hasLocation && setActiveId(hotel.id)}
                      disabled={!hasLocation}
                      aria-pressed={isActive}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                        isActive ? 'bg-accent/8' : 'hover:bg-surface-2',
                        !hasLocation && 'cursor-default opacity-70',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
                          hasLocation ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-ink-3',
                        )}
                        aria-hidden="true"
                      >
                        {hasLocation ? <Building2 className="size-4" /> : <MapPinOff className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-ink">{hotel.name}</p>
                          {!hasLocation && <Badge tone="neutral">Sin ubicar</Badge>}
                        </div>
                        <p className="truncate text-xs text-ink-3">{hotel.city?.name} · {hotel.address}</p>
                        <CapacityMeter occupied={hotel.occupied_rooms} max={hotel.max_rooms} />
                        {hasLocation && (
                          <Link to={`/app/hoteles/${hotel.id}`} onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-accent hover:underline">
                            Ver habitaciones →
                          </Link>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          <section className="card min-h-0 overflow-hidden animate-fade-up" aria-label="Mapa">
            <HotelMap hotels={hotels} activeId={activeId} onSelect={(h) => setActiveId(h.id)} className="rounded-none" />
          </section>
        </div>
      )}
    </div>
  )
}
