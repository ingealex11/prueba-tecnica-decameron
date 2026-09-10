/**
 * Tipos del contrato de la API.
 *
 * Reflejan exactamente la envoltura que produce el backend
 * (`ApiResponse` y `ApiExceptionHandler`). Tenerlos centralizados en un único
 * archivo hace que un cambio en el contrato se manifieste como un error de
 * compilación en todos los puntos afectados, en lugar de como un fallo en
 * tiempo de ejecución descubierto por el usuario.
 */

/** Metadatos de paginación que acompañan a los listados. */
export interface Pagination {
  current_page: number
  per_page: number
  total: number | null
  last_page: number | null
  from: number | null
  to: number | null
}

/** Respuesta correcta de la API. */
export interface ApiSuccess<T> {
  success: true
  message?: string
  data: T
  meta?: {
    pagination?: Pagination
  }
}

/**
 * Respuesta de error de la API.
 *
 * `errors` agrupa los mensajes por campo del formulario, con el mismo formato
 * tanto si el rechazo vino de la validación de entrada como de una regla de
 * negocio. Esa uniformidad es lo que permite volcarlos al formulario con un
 * único bloque de código.
 */
export interface ApiError {
  success: false
  message: string
  error_code: ApiErrorCode
  errors?: Record<string, string[]>
  meta?: Record<string, unknown>
}

/**
 * Códigos de error estables que emite el backend.
 *
 * Se usan para reaccionar de forma distinta según el error sin depender del
 * texto del mensaje, que puede reescribirse o traducirse.
 */
export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_CHALLENGE'
  | 'CHALLENGE_EXPIRED'
  | 'INVALID_TWO_FACTOR_CODE'
  | 'INVALID_ACCOMMODATION_FOR_ROOM_TYPE'
  | 'DUPLICATE_ROOM_CONFIGURATION'
  | 'ROOM_CAPACITY_EXCEEDED'
  | 'MAX_ROOMS_BELOW_CONFIGURED'
  | 'RESOURCE_NOT_FOUND'
  | 'DUPLICATE_RESOURCE'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'TOO_MANY_REQUESTS'
  | 'UNSUPPORTED_ROOM_TYPE'
  | 'INTERNAL_SERVER_ERROR'

/** Resultado paginado ya desempaquetado para su uso en la interfaz. */
export interface Paginated<T> {
  items: T[]
  pagination: Pagination
}

// ---------------------------------------------------------------------------
// Entidades del dominio
// ---------------------------------------------------------------------------

export interface City {
  id: number
  name: string
  dane_code: string | null
}

export interface Accommodation {
  id: number
  name: string
  slug: AccommodationSlug
  capacity: number
}

export interface RoomType {
  id: number
  name: string
  slug: RoomTypeSlug
  /**
   * Acomodaciones que este tipo admite, según las reglas del negocio.
   *
   * Vienen del servidor de forma deliberada: si el frontend las codificara,
   * habría dos copias de la misma regla y podrían divergir en cuanto el
   * negocio cambiara una.
   */
  accommodations: Accommodation[]
}

/** Coordenadas geográficas en grados decimales. */
export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface Hotel {
  id: number
  name: string
  address: string
  /** Ubicación en el mapa; `null` si aún no se ha situado el hotel. */
  location: GeoPoint | null
  nit: string
  max_rooms: number
  /** Habitaciones ya configuradas; lo calcula el servidor. */
  occupied_rooms: number
  /** Habitaciones que aún pueden configurarse. */
  available_rooms: number
  city?: City
  rooms?: HotelRoom[]
  created_at: string | null
  updated_at: string | null
}

export interface HotelRoom {
  id: number
  hotel_id: number
  quantity: number
  room_type?: RoomType
  accommodation?: Accommodation
  created_at: string | null
  updated_at: string | null
}

export type RoomTypeSlug = 'estandar' | 'junior' | 'suite'

export type AccommodationSlug = 'sencilla' | 'doble' | 'triple' | 'cuadruple'

// ---------------------------------------------------------------------------
// Cargas útiles de escritura
// ---------------------------------------------------------------------------

export interface HotelPayload {
  name: string
  address: string
  city_id: number
  nit: string
  max_rooms: number
  latitude?: number | null
  longitude?: number | null
}

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: number
  name: string
  email: string
  initials: string
}

/** Respuesta del primer paso: un desafío pendiente, sin token todavía. */
export interface TwoFactorChallenge {
  challenge_id: string
  /** Segundos de validez del código desde su emisión. */
  expires_in: number
  /** Destino enmascarado al que se envió el código. */
  sent_to: string
  /** Código en claro; sólo presente en modo demostración. */
  demo_code: string | null
}

/** Respuesta del segundo paso: la sesión abierta. */
export interface AuthSession {
  token: string
  token_type: 'Bearer'
  user: AuthUser
}

export interface RoomPayload {
  room_type_id: number
  accommodation_id: number
  quantity: number
}

/** Criterios del listado de hoteles. */
export interface HotelFilters {
  search?: string
  city_id?: number
  page?: number
  per_page?: number
  sort_by?: 'name' | 'nit' | 'max_rooms' | 'created_at'
  sort_direction?: 'asc' | 'desc'
}
