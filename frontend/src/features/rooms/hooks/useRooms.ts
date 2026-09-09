import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'
import { roomService } from '@/shared/api/services'
import type { HotelRoom, RoomPayload } from '@/shared/api/types'

/**
 * Hooks de configuración de habitaciones.
 *
 * Toda escritura aquí altera la capacidad ocupada del hotel, así que además de
 * refrescar la lista de habitaciones hay que refrescar el hotel: es donde vive
 * el contador de disponibles. Olvidarlo dejaría al usuario viendo un número que
 * ya no es cierto, que es precisamente el dato con el que decide cuántas
 * habitaciones puede añadir.
 */

/** Configuraciones de habitación de un hotel. */
export function useRooms(hotelId: number | null) {
  return useQuery<HotelRoom[]>({
    queryKey: queryKeys.rooms.byHotel(hotelId ?? 0),
    queryFn: () => roomService.list(hotelId as number),
    enabled: hotelId !== null,
  })
}

/**
 * Invalida todo lo que una escritura de habitaciones deja desactualizado.
 *
 * Se extrae a una función propia porque las tres mutaciones necesitan
 * exactamente lo mismo, y mantener tres copias sincronizadas es justo el tipo
 * de duplicación que acaba divergiendo.
 */
function useInvalidateRoomData() {
  const queryClient = useQueryClient()

  return (hotelId: number) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.rooms.byHotel(hotelId),
    })
    // El contador de habitaciones ocupadas y disponibles vive en el hotel.
    void queryClient.invalidateQueries({
      queryKey: queryKeys.hotels.detail(hotelId),
    })
    // Y el listado muestra esa misma capacidad en cada fila.
    void queryClient.invalidateQueries({ queryKey: queryKeys.hotels.lists() })
  }
}

/** Asigna una configuración de habitaciones nueva. */
export function useAssignRoom(hotelId: number) {
  const invalidate = useInvalidateRoomData()

  return useMutation({
    mutationFn: (payload: RoomPayload) => roomService.assign(hotelId, payload),
    onSuccess: () => invalidate(hotelId),
  })
}

/** Modifica una configuración existente. */
export function useUpdateRoom(hotelId: number) {
  const invalidate = useInvalidateRoomData()

  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: number; payload: RoomPayload }) =>
      roomService.update(hotelId, roomId, payload),
    onSuccess: () => invalidate(hotelId),
  })
}

/** Elimina una configuración, liberando su cupo. */
export function useDeleteRoom(hotelId: number) {
  const invalidate = useInvalidateRoomData()

  return useMutation({
    mutationFn: (roomId: number) => roomService.remove(hotelId, roomId),
    onSuccess: () => invalidate(hotelId),
  })
}
