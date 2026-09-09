import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useHotel } from '@/features/hotels/hooks/useHotels'
import { RoomForm } from '@/features/rooms/components/RoomForm'
import {
  useAssignRoom,
  useDeleteRoom,
  useRooms,
  useUpdateRoom,
} from '@/features/rooms/hooks/useRooms'
import type { HotelRoom, RoomPayload } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { CapacityMeter } from '@/shared/components/CapacityMeter'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Container } from '@/shared/components/Container'
import { Modal } from '@/shared/components/Modal'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/States'
import { toErrorMessage } from '@/shared/hooks/useServerErrors'

/**
 * Configuración de habitaciones de un hotel.
 *
 * El indicador de capacidad preside la pantalla de forma deliberada: es el dato
 * que gobierna cada decisión del gerente, y tenerlo siempre a la vista evita
 * que descubra el límite sólo cuando el servidor rechaza una asignación.
 */
export function HotelRoomsPage() {
  const { id } = useParams<{ id: string }>()
  const hotelId = Number(id)

  const {
    data: hotel,
    isLoading: loadingHotel,
    isError: hotelError,
    error: hotelErrorObj,
    refetch: refetchHotel,
  } = useHotel(Number.isFinite(hotelId) ? hotelId : null)

  const {
    data: rooms = [],
    isLoading: loadingRooms,
    isError: roomsError,
    error: roomsErrorObj,
  } = useRooms(Number.isFinite(hotelId) ? hotelId : null)

  const [formTarget, setFormTarget] = useState<HotelRoom | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HotelRoom | null>(null)

  const assignRoom = useAssignRoom(hotelId)
  const updateRoom = useUpdateRoom(hotelId)
  const deleteRoom = useDeleteRoom(hotelId)

  if (loadingHotel) {
    return (
      <Container className="py-8">
        <LoadingState rows={4} />
      </Container>
    )
  }

  if (hotelError || !hotel) {
    return (
      <Container className="py-8">
        <ErrorState
          message={toErrorMessage(hotelErrorObj)}
          onRetry={() => void refetchHotel()}
        />
      </Container>
    )
  }

  const handleSubmit = async (payload: RoomPayload) => {
    if (formTarget === 'new') {
      await assignRoom.mutateAsync(payload)
    } else if (formTarget) {
      await updateRoom.mutateAsync({ roomId: formTarget.id, payload })
    }

    setFormTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    await deleteRoom.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const isComplete = hotel.available_rooms === 0

  return (
    <Container className="space-y-6 py-6 sm:py-8">
      {/* Rastro de navegación: permite volver sin recurrir al botón atrás del
          navegador, que en una aplicación de una sola página es menos previsible. */}
      <nav aria-label="Ruta de navegación" className="text-sm">
        <Link to="/app" className="text-brand-700 hover:underline">
          Hoteles
        </Link>
        <span className="mx-2 text-slate-400" aria-hidden="true">
          /
        </span>
        <span className="text-slate-600">{hotel.name}</span>
      </nav>

      <header className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900">
              {hotel.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {hotel.address}
              {hotel.city && ` · ${hotel.city.name}`}
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              NIT {hotel.nit}
            </p>
          </div>

          <div className="w-full lg:w-72">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Capacidad configurada
            </p>
            <CapacityMeter
              occupied={hotel.occupied_rooms}
              max={hotel.max_rooms}
            />
          </div>
        </div>
      </header>

      {isComplete && (
        <Alert tone="info" title="Capacidad completa">
          Las {hotel.max_rooms} habitaciones del hotel están configuradas. Para
          añadir otra configuración, reduzca o elimine alguna de las existentes.
        </Alert>
      )}

      {deleteRoom.isError && (
        <Alert tone="error">{toErrorMessage(deleteRoom.error)}</Alert>
      )}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Configuración de habitaciones
            </h2>
            <p className="text-sm text-slate-500">
              Cantidad de habitaciones por tipo y acomodación.
            </p>
          </div>

          <Button
            onClick={() => setFormTarget('new')}
            disabled={isComplete}
            icon={<span aria-hidden="true">+</span>}
          >
            Asignar habitaciones
          </Button>
        </div>

        {loadingRooms ? (
          <LoadingState rows={3} />
        ) : roomsError ? (
          <ErrorState message={toErrorMessage(roomsErrorObj)} />
        ) : rooms.length === 0 ? (
          <EmptyState
            icon="🛏️"
            title="Sin habitaciones configuradas"
            description={`Este hotel tiene ${hotel.max_rooms} habitaciones disponibles para configurar por tipo y acomodación.`}
            action={
              <Button onClick={() => setFormTarget('new')}>
                Asignar habitaciones
              </Button>
            }
          />
        ) : (
          <RoomList
            rooms={rooms}
            onEdit={setFormTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </section>

      <Modal
        isOpen={formTarget !== null}
        onClose={() => setFormTarget(null)}
        title={
          formTarget === 'new'
            ? 'Asignar habitaciones'
            : 'Editar configuración'
        }
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
        message={
          deleteTarget
            ? `¿Confirma que desea eliminar las ${deleteTarget.quantity} habitaciones ${deleteTarget.room_type?.name} con acomodación ${deleteTarget.accommodation?.name}?`
            : ''
        }
        warning={
          deleteTarget
            ? `Se liberarán ${deleteTarget.quantity} habitaciones de la capacidad del hotel.`
            : undefined
        }
        isLoading={deleteRoom.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Container>
  )
}

/**
 * Listado de configuraciones de habitación.
 *
 * Igual que el listado de hoteles, alterna entre tabla y tarjetas según el
 * ancho disponible en lugar de desplazarse en horizontal.
 */
function RoomList({
  rooms,
  onEdit,
  onDelete,
}: {
  rooms: HotelRoom[]
  onEdit: (room: HotelRoom) => void
  onDelete: (room: HotelRoom) => void
}) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Configuración de habitaciones por tipo y acomodación
          </caption>
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Cantidad</th>
              <th scope="col" className="px-4 py-3 font-semibold">Tipo de habitación</th>
              <th scope="col" className="px-4 py-3 font-semibold">Acomodación</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <tr key={room.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3 text-lg font-semibold text-slate-900">
                  {room.quantity}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {room.room_type?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {room.accommodation?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <RoomActions room={room} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {rooms.map((room) => (
          <li key={room.id} className="flex flex-col gap-3 p-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {room.quantity} habitaciones
              </p>
              <p className="text-sm text-slate-600">
                {room.room_type?.name} · {room.accommodation?.name}
              </p>
            </div>
            <RoomActions room={room} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  )
}

function RoomActions({
  room,
  onEdit,
  onDelete,
}: {
  room: HotelRoom
  onEdit: (room: HotelRoom) => void
  onDelete: (room: HotelRoom) => void
}) {
  const description = `${room.room_type?.name} con acomodación ${room.accommodation?.name}`

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(room)}
        aria-label={`Editar ${description}`}
      >
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(room)}
        className="text-red-600 hover:bg-red-50"
        aria-label={`Eliminar ${description}`}
      >
        Eliminar
      </Button>
    </div>
  )
}
