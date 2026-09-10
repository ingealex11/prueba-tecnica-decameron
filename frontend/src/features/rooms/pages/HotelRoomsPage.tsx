import { BedDouble, MapPinOff, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useHotel } from '@/features/hotels/hooks/useHotels'
import { RoomForm } from '@/features/rooms/components/RoomForm'
import { useAssignRoom, useDeleteRoom, useRooms, useUpdateRoom } from '@/features/rooms/hooks/useRooms'
import type { HotelRoom, RoomPayload } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { CapacityMeter } from '@/shared/components/CapacityMeter'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Menu } from '@/shared/components/Menu'
import { Modal } from '@/shared/components/Modal'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/States'
import { useToast } from '@/shared/components/toastContext'
import { HotelMap } from '@/shared/components/map/HotelMap'
import { toErrorMessage } from '@/shared/hooks/useServerErrors'

/**
 * Configuración de habitaciones de un hotel.
 *
 * El indicador de capacidad preside la pantalla de forma deliberada: es el
 * dato que gobierna cada decisión del gerente, y tenerlo siempre a la vista
 * evita que descubra el límite sólo cuando el servidor rechaza una asignación.
 */
export function HotelRoomsPage() {
  const { id } = useParams<{ id: string }>()
  const hotelId = Number(id)
  const validId = Number.isFinite(hotelId) ? hotelId : null
  const toast = useToast()

  const { data: hotel, isLoading: loadingHotel, isError: hotelError, error: hotelErrorObj, refetch: refetchHotel } = useHotel(validId)
  const { data: rooms = [], isLoading: loadingRooms, isError: roomsError, error: roomsErrorObj } = useRooms(validId)

  const [formTarget, setFormTarget] = useState<HotelRoom | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HotelRoom | null>(null)

  const assignRoom = useAssignRoom(hotelId)
  const updateRoom = useUpdateRoom(hotelId)
  const deleteRoom = useDeleteRoom(hotelId)

  if (loadingHotel) {
    return <div className="card"><LoadingState rows={4} /></div>
  }

  if (hotelError || !hotel) {
    return <div className="card"><ErrorState message={toErrorMessage(hotelErrorObj)} onRetry={() => void refetchHotel()} /></div>
  }

  const handleSubmit = async (payload: RoomPayload) => {
    if (formTarget === 'new') {
      const created = await assignRoom.mutateAsync(payload)
      toast.success('Habitaciones asignadas', `${created.quantity} ${created.room_type?.name} · ${created.accommodation?.name}`)
    } else if (formTarget) {
      await updateRoom.mutateAsync({ roomId: formTarget.id, payload })
      toast.success('Configuración actualizada')
    }
    setFormTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteRoom.mutateAsync(deleteTarget.id)
    toast.success('Configuración eliminada', `Se liberaron ${deleteTarget.quantity} habitaciones.`)
    setDeleteTarget(null)
  }

  const isComplete = hotel.available_rooms === 0

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Hoteles', to: '/app/hoteles' }, { label: hotel.name }]}
        title={hotel.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{hotel.address}{hotel.city && ` · ${hotel.city.name}`}</span>
            <span className="text-ink-3">·</span>
            <span className="font-mono text-xs">NIT {hotel.nit}</span>
          </span>
        }
        actions={
          <Button onClick={() => setFormTarget('new')} disabled={isComplete} icon={<Plus />}>
            Asignar habitaciones
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2 animate-fade-up" aria-labelledby="capacity-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="capacity-title" className="eyebrow">Capacidad configurada</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-ink tabular-nums">
                {hotel.occupied_rooms}
                <span className="text-xl font-medium text-ink-3"> / {hotel.max_rooms}</span>
              </p>
              <p className="mt-1 text-sm text-ink-2">
                {isComplete ? 'Todas las habitaciones están configuradas.' : `${hotel.available_rooms} habitaciones disponibles para configurar.`}
              </p>
            </div>
            {isComplete ? <Badge tone="danger" dot>Completo</Badge> : hotel.occupied_rooms === 0 ? <Badge tone="neutral" dot>Sin configurar</Badge> : <Badge tone="success" dot>Con cupo</Badge>}
          </div>
          <div className="mt-5">
            <CapacityMeter occupied={hotel.occupied_rooms} max={hotel.max_rooms} />
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5 text-sm">
            {[
              ['Configuraciones', rooms.length],
              ['Tipos distintos', new Set(rooms.map((r) => r.room_type?.id)).size],
              ['Acomodaciones', new Set(rooms.map((r) => r.accommodation?.id)).size],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card overflow-hidden animate-fade-up" aria-label="Ubicación del hotel">
          {hotel.location ? (
            <div className="h-full min-h-56">
              <HotelMap hotels={[hotel]} static className="rounded-none" />
            </div>
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center gap-2 p-6 text-center">
              <MapPinOff className="size-6 text-ink-3" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">Sin ubicación en el mapa</p>
              <p className="text-xs text-ink-3">Edite el hotel para situarlo.</p>
            </div>
          )}
        </section>
      </div>

      {isComplete && (
        <Alert tone="info" title="Capacidad completa">
          Las {hotel.max_rooms} habitaciones del hotel están configuradas. Para añadir otra configuración, reduzca o
          elimine alguna de las existentes.
        </Alert>
      )}

      {deleteRoom.isError && <Alert tone="error">{toErrorMessage(deleteRoom.error)}</Alert>}

      <section className="card overflow-hidden animate-fade-up">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-semibold text-ink">Configuración de habitaciones</h2>
            <p className="text-sm text-ink-2">Cantidad de habitaciones por tipo y acomodación.</p>
          </div>
        </header>

        {loadingRooms ? (
          <LoadingState rows={3} />
        ) : roomsError ? (
          <ErrorState message={toErrorMessage(roomsErrorObj)} />
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="Sin habitaciones configuradas"
            description={`Este hotel tiene ${hotel.max_rooms} habitaciones disponibles para configurar por tipo y acomodación.`}
            action={<Button onClick={() => setFormTarget('new')} icon={<Plus />}>Asignar habitaciones</Button>}
          />
        ) : (
          <RoomList rooms={rooms} maxRooms={hotel.max_rooms} onEdit={setFormTarget} onDelete={setDeleteTarget} />
        )}
      </section>

      <Modal
        isOpen={formTarget !== null}
        onClose={() => setFormTarget(null)}
        title={formTarget === 'new' ? 'Asignar habitaciones' : 'Editar configuración'}
        description="La acomodación debe corresponder al tipo de habitación seleccionado."
      >
        {formTarget !== null && (
          <RoomForm
            hotel={hotel}
            room={formTarget === 'new' ? undefined : formTarget}
            existingRooms={rooms}
            isSubmitting={assignRoom.isPending || updateRoom.isPending}
            onSubmit={handleSubmit}
            onCancel={() => setFormTarget(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Eliminar configuración"
        message={deleteTarget ? `¿Confirma que desea eliminar las ${deleteTarget.quantity} habitaciones ${deleteTarget.room_type?.name} con acomodación ${deleteTarget.accommodation?.name}?` : ''}
        warning={deleteTarget ? `Se liberarán ${deleteTarget.quantity} habitaciones de la capacidad del hotel.` : undefined}
        isLoading={deleteRoom.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function RoomList({
  rooms,
  maxRooms,
  onEdit,
  onDelete,
}: {
  rooms: HotelRoom[]
  maxRooms: number
  onEdit: (room: HotelRoom) => void
  onDelete: (room: HotelRoom) => void
}) {
  const actionsFor = (room: HotelRoom) => (
    <Menu
      triggerLabel={`Acciones para ${room.room_type?.name} ${room.accommodation?.name}`}
      trigger={<MoreHorizontal className="size-[18px]" />}
      items={[
        { label: 'Editar cantidad', icon: <Pencil />, onSelect: () => onEdit(room) },
        'separator',
        { label: 'Eliminar configuración', icon: <Trash2 />, tone: 'danger', onSelect: () => onDelete(room) },
      ]}
    />
  )

  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Configuración de habitaciones por tipo y acomodación</caption>
          <thead className="border-b border-line bg-surface-2/60">
            <tr>
              <th scope="col" className="eyebrow py-3 pl-5 pr-4">Cantidad</th>
              <th scope="col" className="eyebrow px-4 py-3">Tipo de habitación</th>
              <th scope="col" className="eyebrow px-4 py-3">Acomodación</th>
              <th scope="col" className="eyebrow px-4 py-3">Peso</th>
              <th scope="col" className="w-14 px-4 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rooms.map((room) => {
              const share = maxRooms > 0 ? Math.round((room.quantity / maxRooms) * 100) : 0
              return (
                <tr key={room.id} className="transition-colors hover:bg-surface-2/60">
                  <td className="py-3 pl-5 pr-4 text-xl font-semibold tabular-nums text-ink">{room.quantity}</td>
                  <td className="px-4 py-3"><Badge tone="brand">{room.room_type?.name ?? '—'}</Badge></td>
                  <td className="px-4 py-3 text-ink-2">{room.accommodation?.name ?? '—'}{room.accommodation && <span className="ml-1.5 text-xs text-ink-3">· {room.accommodation.capacity} {room.accommodation.capacity === 1 ? 'persona' : 'personas'}</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-ink-3">{share}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{actionsFor(room)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {rooms.map((room) => (
          <li key={room.id} className="flex items-center gap-3 p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-lg font-bold tabular-nums text-accent">{room.quantity}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{room.room_type?.name}</p>
              <p className="text-sm text-ink-2">{room.accommodation?.name}</p>
            </div>
            {actionsFor(room)}
          </li>
        ))}
      </ul>
    </>
  )
}
