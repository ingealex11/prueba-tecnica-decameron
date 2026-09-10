import { Building2, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { HotelFilterBar } from '@/features/hotels/components/HotelFilterBar'
import { HotelForm } from '@/features/hotels/components/HotelForm'
import { HotelTable } from '@/features/hotels/components/HotelTable'
import { useCreateHotel, useDeleteHotel, useHotels, useUpdateHotel } from '@/features/hotels/hooks/useHotels'
import type { Hotel, HotelFilters, HotelPayload } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Modal } from '@/shared/components/Modal'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/States'
import { useToast } from '@/shared/components/toastContext'
import { toErrorMessage } from '@/shared/hooks/useServerErrors'

/**
 * Inventario de hoteles de la compañía.
 *
 * Reúne listado, búsqueda, alta, edición y baja. El estado de los diálogos
 * vive aquí y no dentro de la tabla, para que la tabla se ocupe únicamente de
 * presentar datos y pueda probarse sin montar toda la pantalla.
 */
export function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<HotelFilters>({ per_page: 10, sort_by: 'name' })
  // `?nuevo=1` abre el formulario de alta directamente; lo usa el acceso
  // rápido del panel. Se lee al montar, como estado inicial, y no en un
  // efecto: así no provoca un render extra.
  const [formTarget, setFormTarget] = useState<Hotel | 'new' | null>(() => (searchParams.get('nuevo') ? 'new' : null))
  const [deleteTarget, setDeleteTarget] = useState<Hotel | null>(null)
  const toast = useToast()

  const { data, isLoading, isError, error, refetch, isFetching } = useHotels(filters)

  const createHotel = useCreateHotel()
  const updateHotel = useUpdateHotel()
  const deleteHotel = useDeleteHotel()

  // Se limpia el parámetro de la URL para que recargar no vuelva a abrir el
  // formulario. Es una sincronización con el navegador, no con el estado.
  useEffect(() => {
    if (searchParams.has('nuevo')) {
      const next = new URLSearchParams(searchParams)
      next.delete('nuevo')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleFiltersChange = useCallback((next: HotelFilters) => setFilters(next), [])

  const handleSubmit = async (payload: HotelPayload) => {
    if (formTarget === 'new') {
      const created = await createHotel.mutateAsync(payload)
      toast.success('Hotel registrado', `${created.name} quedó registrado con ${created.max_rooms} habitaciones.`)
    } else if (formTarget) {
      const updated = await updateHotel.mutateAsync({ id: formTarget.id, payload })
      toast.success('Cambios guardados', `Los datos de ${updated.name} se actualizaron.`)
    }

    // Sólo se cierra si la operación tuvo éxito: si falló, el diálogo debe
    // permanecer abierto mostrando el error con los datos intactos.
    setFormTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteHotel.mutateAsync(deleteTarget.id)
    toast.success('Hotel eliminado', `${deleteTarget.name} se dio de baja.`)
    setDeleteTarget(null)
  }

  const hotels = data?.items ?? []
  const hasFilters = Boolean(filters.search || filters.city_id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hoteles"
        description="Inventario de hoteles de la compañía y su configuración de habitaciones."
        actions={<Button onClick={() => setFormTarget('new')} icon={<Plus />}>Registrar hotel</Button>}
      />

      {deleteHotel.isError && <Alert tone="error">{toErrorMessage(deleteHotel.error)}</Alert>}

      <section className="card overflow-hidden animate-fade-up">
        <HotelFilterBar filters={filters} onChange={handleFiltersChange} total={data?.pagination.total ?? null} />

        {/* Franja sutil mientras se refresca en segundo plano: informa sin
            vaciar la tabla, que es lo que produce sensación de parpadeo. */}
        <div className="h-0.5 bg-line">
          {isFetching && !isLoading && <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" aria-hidden="true" />}
        </div>

        {isLoading ? (
          <LoadingState rows={5} />
        ) : isError ? (
          <ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} />
        ) : hotels.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={hasFilters ? 'Sin resultados' : 'Aún no hay hoteles'}
            description={
              hasFilters
                ? 'Ningún hotel coincide con la búsqueda. Pruebe con otros criterios.'
                : 'Registre el primer hotel para empezar a configurar sus habitaciones.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={() => setFilters({ per_page: 10, sort_by: 'name' })}>Limpiar filtros</Button>
              ) : (
                <Button onClick={() => setFormTarget('new')} icon={<Plus />}>Registrar hotel</Button>
              )
            }
          />
        ) : (
          <>
            <HotelTable
              hotels={hotels}
              sortBy={filters.sort_by}
              sortDirection={filters.sort_direction}
              onSort={(sort_by, sort_direction) => setFilters({ ...filters, sort_by, sort_direction, page: 1 })}
              onEdit={setFormTarget}
              onDelete={setDeleteTarget}
            />
            {data && <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ ...filters, page })} />}
          </>
        )}
      </section>

      <Modal
        isOpen={formTarget !== null}
        onClose={() => setFormTarget(null)}
        title={formTarget === 'new' ? 'Registrar hotel' : 'Editar hotel'}
        description={formTarget === 'new' ? 'Datos básicos, tributarios y ubicación del hotel.' : 'Modifique los datos del hotel.'}
        size="xl"
      >
        {formTarget !== null && (
          <HotelForm
            hotel={formTarget === 'new' ? undefined : formTarget}
            isSubmitting={createHotel.isPending || updateHotel.isPending}
            onSubmit={handleSubmit}
            onCancel={() => setFormTarget(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Eliminar hotel"
        message={`¿Confirma que desea eliminar "${deleteTarget?.name}"?`}
        warning={
          deleteTarget && deleteTarget.occupied_rooms > 0
            ? `El hotel tiene ${deleteTarget.occupied_rooms} habitaciones configuradas que dejarán de estar disponibles.`
            : undefined
        }
        isLoading={deleteHotel.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
