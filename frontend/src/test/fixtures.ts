import type { City, Hotel, HotelRoom, RoomType } from '@/shared/api/types'

/**
 * Datos de ejemplo para las pruebas.
 *
 * Reproducen la matriz de acomodaciones del enunciado y el hotel de su ejemplo,
 * de modo que las pruebas se lean como el documento original.
 *
 * Están centralizados para que un cambio en el contrato de la API se corrija en
 * un solo sitio y no en cada archivo de pruebas.
 */

export const cities: City[] = [
  { id: 1, name: 'Cartagena', dane_code: '13001' },
  { id: 2, name: 'Santa Marta', dane_code: '47001' },
]

/** Catálogo con las combinaciones exactas que declara el enunciado. */
export const roomTypes: RoomType[] = [
  {
    id: 1,
    name: 'Estándar',
    slug: 'estandar',
    accommodations: [
      { id: 1, name: 'Sencilla', slug: 'sencilla', capacity: 1 },
      { id: 2, name: 'Doble', slug: 'doble', capacity: 2 },
    ],
  },
  {
    id: 2,
    name: 'Junior',
    slug: 'junior',
    accommodations: [
      { id: 3, name: 'Triple', slug: 'triple', capacity: 3 },
      { id: 4, name: 'Cuádruple', slug: 'cuadruple', capacity: 4 },
    ],
  },
  {
    id: 3,
    name: 'Suite',
    slug: 'suite',
    accommodations: [
      { id: 1, name: 'Sencilla', slug: 'sencilla', capacity: 1 },
      { id: 2, name: 'Doble', slug: 'doble', capacity: 2 },
      { id: 3, name: 'Triple', slug: 'triple', capacity: 3 },
    ],
  },
]

/** Hotel del ejemplo del enunciado, con capacidad libre. */
export function makeHotel(overrides: Partial<Hotel> = {}): Hotel {
  const maxRooms = overrides.max_rooms ?? 42
  const occupied = overrides.occupied_rooms ?? 0

  return {
    id: 1,
    name: 'Decameron Cartagena',
    address: 'Calle 23 58-25',
    nit: '12345678-9',
    max_rooms: maxRooms,
    occupied_rooms: occupied,
    available_rooms: Math.max(0, maxRooms - occupied),
    city: cities[0],
    created_at: '2026-01-01T00:00:00+00:00',
    updated_at: '2026-01-01T00:00:00+00:00',
    ...overrides,
  }
}

export function makeRoom(overrides: Partial<HotelRoom> = {}): HotelRoom {
  return {
    id: 1,
    hotel_id: 1,
    quantity: 25,
    room_type: roomTypes[0],
    accommodation: roomTypes[0].accommodations[0],
    created_at: '2026-01-01T00:00:00+00:00',
    updated_at: '2026-01-01T00:00:00+00:00',
    ...overrides,
  }
}
