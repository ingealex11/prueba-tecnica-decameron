import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { queryKeys } from '@/shared/api/queryKeys'
import { catalogService } from '@/shared/api/services'
import type { Accommodation, City, RoomType } from '@/shared/api/types'

/**
 * Los catálogos cambian con muy poca frecuencia —una ciudad nueva cuando la
 * compañía abre operación— pero se consultan en cada apertura de formulario.
 *
 * Una hora de vigencia evita repetir esas peticiones durante toda la sesión sin
 * llegar a servir datos obsoletos de forma apreciable.
 */
const CATALOG_STALE_TIME = 60 * 60 * 1000

/** Ciudades disponibles para registrar un hotel. */
export function useCities() {
  return useQuery<City[]>({
    queryKey: queryKeys.catalogs.cities(),
    queryFn: catalogService.cities,
    staleTime: CATALOG_STALE_TIME,
  })
}

/** Tipos de habitación con las acomodaciones que cada uno admite. */
export function useRoomTypes() {
  return useQuery<RoomType[]>({
    queryKey: queryKeys.catalogs.roomTypes(),
    queryFn: catalogService.roomTypes,
    staleTime: CATALOG_STALE_TIME,
  })
}

/**
 * Acomodaciones permitidas para un tipo de habitación concreto.
 *
 * Es el hook que hace cumplir en la interfaz la regla del enunciado: al elegir
 * "Junior", el selector de acomodación ofrece únicamente Triple y Cuádruple.
 *
 * La regla no está codificada aquí: se limita a leer lo que el servidor declara
 * para ese tipo. Así la interfaz no puede contradecir al backend, y añadir un
 * tipo de habitación nuevo no exige tocar el frontend.
 *
 * @param roomTypeId Tipo seleccionado, o `null` si aún no se eligió ninguno.
 */
export function useAllowedAccommodations(roomTypeId: number | null): {
  accommodations: Accommodation[]
  isLoading: boolean
} {
  const { data: roomTypes = [], isLoading } = useRoomTypes()

  const accommodations = useMemo(() => {
    if (roomTypeId === null) {
      return []
    }

    return (
      roomTypes.find((type) => type.id === roomTypeId)?.accommodations ?? []
    )
  }, [roomTypes, roomTypeId])

  return { accommodations, isLoading }
}
