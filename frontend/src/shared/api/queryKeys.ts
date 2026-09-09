import type { HotelFilters } from './types'

/**
 * Claves de caché de TanStack Query.
 *
 * Centralizarlas evita el problema más común al usar esta librería: escribir la
 * clave a mano en cada sitio y equivocarse en uno, con lo que una mutación
 * invalida una entrada de caché distinta de la que se muestra y la interfaz
 * queda desactualizada sin error visible.
 *
 * La jerarquía es deliberada. `['hotels']` es prefijo de `['hotels','list',…]`
 * y de `['hotels','detail',…]`, así que invalidar la raíz refresca todo lo
 * relacionado con hoteles de una sola vez.
 */
export const queryKeys = {
  catalogs: {
    all: ['catalogs'] as const,
    cities: () => [...queryKeys.catalogs.all, 'cities'] as const,
    roomTypes: () => [...queryKeys.catalogs.all, 'room-types'] as const,
    accommodations: () => [...queryKeys.catalogs.all, 'accommodations'] as const,
  },

  hotels: {
    all: ['hotels'] as const,
    lists: () => [...queryKeys.hotels.all, 'list'] as const,
    // Los filtros forman parte de la clave: cada combinación de búsqueda y
    // página se cachea por separado, de modo que volver atrás es instantáneo.
    list: (filters: HotelFilters) =>
      [...queryKeys.hotels.lists(), filters] as const,
    details: () => [...queryKeys.hotels.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.hotels.details(), id] as const,
  },

  rooms: {
    all: ['rooms'] as const,
    byHotel: (hotelId: number) => [...queryKeys.rooms.all, hotelId] as const,
  },
} as const
