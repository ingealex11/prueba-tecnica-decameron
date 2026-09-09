import { useCallback, useState } from 'react'

import { HotelFilterBar } from '@/features/hotels/components/HotelFilterBar'
import { HotelForm } from '@/features/hotels/components/HotelForm'
import { HotelTable } from '@/features/hotels/components/HotelTable'
import {
  useCreateHotel,
  useDeleteHotel,
  useHotels,
  useUpdateHotel,
} from '@/features/hotels/hooks/useHotels'
import type { Hotel, HotelFilters, HotelPayload } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Container } from '@/shared/components/Container'
import { Modal } from '@/shared/components/Modal'
import { Pagination } from '@/shared/components/Pagination'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/States'
import { toErrorMessage } from '@/shared/hooks/useServerErrors'

/**
 * Pantalla principal: inventario de hoteles de la compañía.
 *
 * Reúne listado, búsqueda, alta, edición y baja. El estado de los diálogos vive
 * aquí y no dentro de la tabla, para que la tabla se ocupe únicamente de
 * presentar datos y pueda probarse sin montar toda la pantalla.
 */
export function HotelsPage() {
  const [filters, setFilters] = useState<HotelFilters>({ per_page: 10 })

  // `null` significa "diálogo cerrado"; un hotel, "editando ése"; y el
  // literal 'new', "dando de alta uno nuevo". Un único estado evita las
  // combinaciones imposibles que surgen al usar varios booleanos sueltos.
  const [formTarget, setFormTarget] = useState<Hotel | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Hotel | null>(null)

  const { data, isLoading, isError, error, refetch, isFetching } =
    useHotels(filters)

  const createHotel = useCreateHotel()
  const updateHotel = useUpdateHotel()
  const deleteHotel = useDeleteHotel()

  // `useCallback` evita recrear la función en cada render, cosa que dispararía
  // el efecto de la barra de filtros en bucle.
  const handleFiltersChange = useCallback((next: HotelFilters) => {
    setFilters(next)
  }, [])

  const handleSubmit = async (payload: HotelPayload) => {
    if (formTarget === 'new') {
      await createHotel.mutateAsync(payload)
    } else if (formTarget) {
      await updateHotel.mutateAsync({ id: formTarget.id, payload })
    }

    // Sólo se cierra si la operación tuvo éxito: si falló, el diálogo debe
    // permanecer abierto mostrando el error, con los datos que el usuario
    // escribió intactos.
    setFormTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    await deleteHotel.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const hotels = data?.items ?? []
  const hasFilters = Boolean(filters.search || filters.city_id)

  return (
    <Container className="space-y-6 py-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hoteles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inventario de hoteles de la compañía y su configuración de
            habitaciones.
          </p>
        </div>

        <Button onClick={() => setFormTarget('new')} icon={<span aria-hidden="true">+</span>}>
          Registrar hotel
        </Button>
      </header>

      {deleteHotel.isError && (
        <Alert tone="error">{toErrorMessage(deleteHotel.error)}</Alert>
      )}

      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <HotelFilterBar filters={filters} onChange={handleFiltersChange} />

        {/* Franja sutil mientras se refresca en segundo plano: informa sin
            vaciar la tabla, que es lo que produce sensación de parpadeo. */}
        {isFetching && !isLoading && (
          <div className="h-0.5 animate-pulse bg-brand-400" aria-hidden="true" />
        )}

        {isLoading ? (
          <LoadingState rows={5} />
        ) : isError ? (
          <ErrorState message={toErrorMessage(error)} onRetry={() => void refetch()} />
        ) : hotels.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'Sin resultados' : 'Aún no hay hoteles'}
            description={
              hasFilters
                ? 'Ningún hotel coincide con la búsqueda. Pruebe con otros criterios.'
                : 'Registre el primer hotel para empezar a configurar sus habitaciones.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={() => setFilters({ per_page: 10 })}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button onClick={() => setFormTarget('new')}>Registrar hotel</Button>
              )
            }
          />
        ) : (
          <>
            <HotelTable
              hotels={hotels}
              onEdit={setFormTarget}
              onDelete={setDeleteTarget}
            />
            {data && (
              <Pagination
                pagination={data.pagination}
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            )}
          </>
        )}
      </section>

      <Modal
        isOpen={formTarget !== null}
        onClose={() => setFormTarget(null)}
        title={formTarget === 'new' ? 'Registrar hotel' : 'Editar hotel'}
        description={
          formTarget === 'new'
            ? 'Datos básicos y tributarios del hotel.'
            : 'Modifique los datos del hotel.'
        }
        size="lg"
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
    </Container>
  )
}
