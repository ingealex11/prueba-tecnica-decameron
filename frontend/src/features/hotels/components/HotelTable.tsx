import { ArrowDown, ArrowUp, ArrowUpDown, BedDouble, MapPin, MapPinOff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import type { Hotel, HotelFilters } from '@/shared/api/types'
import { Badge } from '@/shared/components/Badge'
import { CapacityMeter } from '@/shared/components/CapacityMeter'
import { Menu } from '@/shared/components/Menu'
import { cn } from '@/shared/utils/cn'

type SortKey = NonNullable<HotelFilters['sort_by']>
type SortDir = NonNullable<HotelFilters['sort_direction']>

interface HotelTableProps {
  hotels: Hotel[]
  sortBy?: SortKey
  sortDirection?: SortDir
  onSort: (key: SortKey, direction: SortDir) => void
  onEdit: (hotel: Hotel) => void
  onDelete: (hotel: Hotel) => void
}

/**
 * Listado de hoteles.
 *
 * Desde 1024 px una tabla con columnas ordenables; por debajo, tarjetas
 * apiladas. Ambas presentaciones muestran los mismos datos y ofrecen las
 * mismas acciones: la versión estrecha no es una versión recortada.
 */
export function HotelTable({ hotels, sortBy = 'name', sortDirection = 'asc', onSort, onEdit, onDelete }: HotelTableProps) {
  const navigate = useNavigate()

  const actionsFor = (hotel: Hotel) => (
    <Menu
      triggerLabel={`Acciones para ${hotel.name}`}
      trigger={<MoreHorizontal className="size-[18px]" />}
      items={[
        { label: 'Configurar habitaciones', icon: <BedDouble />, onSelect: () => navigate(`/app/hoteles/${hotel.id}`) },
        { label: 'Editar datos', icon: <Pencil />, onSelect: () => onEdit(hotel) },
        'separator',
        { label: 'Eliminar hotel', icon: <Trash2 />, tone: 'danger', onSelect: () => onDelete(hotel) },
      ]}
    />
  )

  return (
    <>
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Hoteles registrados, con su ubicación, NIT y capacidad configurada</caption>
          <thead className="border-b border-line bg-surface-2/60">
            <tr>
              <SortableHeader label="Hotel" column="name" current={sortBy} direction={sortDirection} onSort={onSort} className="pl-5" />
              <th scope="col" className="eyebrow px-4 py-3">Ciudad</th>
              <SortableHeader label="NIT" column="nit" current={sortBy} direction={sortDirection} onSort={onSort} />
              <SortableHeader label="Capacidad" column="max_rooms" current={sortBy} direction={sortDirection} onSort={onSort} />
              <th scope="col" className="eyebrow px-4 py-3">Estado</th>
              <th scope="col" className="w-14 px-4 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {hotels.map((hotel) => (
              <tr key={hotel.id} className="group transition-colors hover:bg-surface-2/60">
                <td className="py-3 pl-5 pr-4">
                  <Link to={`/app/hoteles/${hotel.id}`} className="block">
                    <p className="font-medium text-ink group-hover:text-accent">{hotel.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-3">
                      {hotel.location ? <MapPin className="size-3" aria-hidden="true" /> : <MapPinOff className="size-3" aria-hidden="true" />}
                      {hotel.address}
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-2">{hotel.city?.name ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-2">{hotel.nit}</td>
                <td className="px-4 py-3"><CapacityMeter occupied={hotel.occupied_rooms} max={hotel.max_rooms} compact /></td>
                <td className="px-4 py-3"><StatusBadge hotel={hotel} /></td>
                <td className="px-4 py-3 text-right">{actionsFor(hotel)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line lg:hidden">
        {hotels.map((hotel) => (
          <li key={hotel.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <Link to={`/app/hoteles/${hotel.id}`} className="min-w-0">
                <p className="font-medium text-ink">{hotel.name}</p>
                <p className="text-sm text-ink-2">{hotel.address}</p>
                <p className="mt-1 text-xs text-ink-3">{hotel.city?.name ?? '—'} · NIT {hotel.nit}</p>
              </Link>
              {actionsFor(hotel)}
            </div>
            <div className="flex items-center justify-between gap-3">
              <CapacityMeter occupied={hotel.occupied_rooms} max={hotel.max_rooms} />
            </div>
            <StatusBadge hotel={hotel} />
          </li>
        ))}
      </ul>
    </>
  )
}

function StatusBadge({ hotel }: { hotel: Hotel }) {
  if (hotel.available_rooms === 0) return <Badge tone="danger" dot>Completo</Badge>
  if (hotel.occupied_rooms === 0) return <Badge tone="neutral" dot>Sin configurar</Badge>
  if (hotel.occupied_rooms / hotel.max_rooms >= 0.85) return <Badge tone="warning" dot>Casi completo</Badge>
  return <Badge tone="success" dot>Con cupo</Badge>
}

function SortableHeader({
  label,
  column,
  current,
  direction,
  onSort,
  className,
}: {
  label: string
  column: SortKey
  current: SortKey
  direction: SortDir
  onSort: (key: SortKey, direction: SortDir) => void
  className?: string
}) {
  const isActive = current === column
  const next: SortDir = isActive && direction === 'asc' ? 'desc' : 'asc'
  const Icon = !isActive ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <th scope="col" aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('px-4 py-3', className)}>
      <button
        type="button"
        onClick={() => onSort(column, next)}
        className={cn('eyebrow inline-flex items-center gap-1 transition-colors hover:text-ink', isActive && 'text-ink')}
      >
        {label}
        <Icon className="size-3.5" aria-hidden="true" />
      </button>
    </th>
  )
}
