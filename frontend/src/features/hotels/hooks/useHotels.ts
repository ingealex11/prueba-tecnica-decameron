import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'
import { hotelService } from '@/shared/api/services'
import type {
  Hotel,
  HotelFilters,
  HotelPayload,
  Paginated,
} from '@/shared/api/types'

/**
 * Hooks de acceso a los hoteles.
 *
 * Los componentes no llaman al servicio directamente: lo hacen a través de
 * estos hooks, que resuelven caché, estados de carga y error, y —lo más
 * delicado— qué debe refrescarse tras cada escritura.
 */

/** Listado paginado de hoteles. */
export function useHotels(filters: HotelFilters = {}) {
  return useQuery<Paginated<Hotel>>({
    queryKey: queryKeys.hotels.list(filters),
    queryFn: () => hotelService.list(filters),
    /*
     * Conserva en pantalla la página anterior mientras carga la siguiente.
     *
     * Sin esto, cada cambio de página o cada tecla escrita en el buscador
     * vaciaría la tabla y volvería a llenarla, produciendo un parpadeo que hace
     * la interfaz sentirse lenta aunque la respuesta sea rápida.
     */
    placeholderData: keepPreviousData,
  })
}

/** Detalle de un hotel con sus configuraciones de habitación. */
export function useHotel(id: number | null) {
  return useQuery<Hotel>({
    queryKey: queryKeys.hotels.detail(id ?? 0),
    queryFn: () => hotelService.find(id as number),
    // Sin identificador no hay nada que pedir; `enabled` evita una petición
    // condenada a fallar cuando aún no se seleccionó ningún hotel.
    enabled: id !== null,
  })
}

/** Registra un hotel nuevo. */
export function useCreateHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: HotelPayload) => hotelService.create(payload),
    onSuccess: () => {
      // Sólo se invalidan los listados: el detalle de otros hoteles no cambió
      // porque se haya creado uno nuevo, y refrescarlo sería trabajo inútil.
      void queryClient.invalidateQueries({ queryKey: queryKeys.hotels.lists() })
    },
  })
}

/** Actualiza los datos de un hotel. */
export function useUpdateHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HotelPayload }) =>
      hotelService.update(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hotels.lists() })
      // El detalle de este hotel sí cambió: editar el máximo de habitaciones
      // altera las disponibles que muestra la pantalla de configuración.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.hotels.detail(updated.id),
      })
    },
  })
}

/** Da de baja un hotel. */
export function useDeleteHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => hotelService.remove(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.hotels.lists() })
      // Se retira el detalle de la caché en lugar de invalidarlo: invalidarlo
      // provocaría una petición a un recurso que acaba de dejar de existir.
      queryClient.removeQueries({ queryKey: queryKeys.hotels.detail(id) })
    },
  })
}
