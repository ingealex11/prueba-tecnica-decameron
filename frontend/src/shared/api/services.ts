import { httpClient } from './client'
import type {
  Accommodation,
  ApiSuccess,
  AuthSession,
  AuthUser,
  City,
  Hotel,
  HotelFilters,
  HotelPayload,
  HotelRoom,
  Paginated,
  RoomPayload,
  RoomType,
  TwoFactorChallenge,
} from './types'

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export const authService = {
  /** Paso 1: credenciales. Devuelve un desafío, no un token. */
  async login(email: string, password: string, deviceName: string): Promise<TwoFactorChallenge> {
    const { data } = await httpClient.post<ApiSuccess<TwoFactorChallenge>>('/auth/login', {
      email,
      password,
      device_name: deviceName,
    })

    return data.data
  },

  /** Paso 2: código de verificación. Devuelve la sesión con su token. */
  async verify(challengeId: string, code: string, deviceName: string): Promise<AuthSession> {
    const { data } = await httpClient.post<ApiSuccess<AuthSession>>('/auth/verify', {
      challenge_id: challengeId,
      code,
      device_name: deviceName,
    })

    return data.data
  },

  /** Persona a la que pertenece el token actual. */
  async me(): Promise<AuthUser> {
    const { data } = await httpClient.get<ApiSuccess<AuthUser>>('/auth/me')

    return data.data
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },
}

/**
 * Funciones que consumen la API.
 *
 * Son la única capa que conoce las rutas del backend. Los componentes llaman a
 * estas funciones a través de hooks, de modo que si un endpoint cambia de forma
 * o de dirección, sólo hay que tocar este archivo.
 *
 * Cada función devuelve ya el contenido útil, no la envoltura: desempaquetar
 * `response.data.data` en cada componente sería ruido repetido y una fuente
 * fácil de erratas.
 */

// ---------------------------------------------------------------------------
// Catálogos
// ---------------------------------------------------------------------------

export const catalogService = {
  /** Ciudades donde la compañía puede registrar hoteles. */
  async cities(): Promise<City[]> {
    const { data } = await httpClient.get<ApiSuccess<City[]>>('/catalogs/cities')

    return data.data
  },

  /**
   * Tipos de habitación con las acomodaciones que cada uno admite.
   *
   * Es la fuente desde la que la interfaz limita el selector de acomodación.
   * Se consulta al servidor en lugar de codificar la regla en el cliente,
   * porque duplicarla crearía dos versiones que podrían divergir.
   */
  async roomTypes(): Promise<RoomType[]> {
    const { data } =
      await httpClient.get<ApiSuccess<RoomType[]>>('/catalogs/room-types')

    return data.data
  },

  /** Todas las acomodaciones del catálogo. */
  async accommodations(): Promise<Accommodation[]> {
    const { data } = await httpClient.get<ApiSuccess<Accommodation[]>>(
      '/catalogs/accommodations',
    )

    return data.data
  },
}

// ---------------------------------------------------------------------------
// Hoteles
// ---------------------------------------------------------------------------

export const hotelService = {
  /** Listado paginado, con búsqueda, filtro y ordenamiento. */
  async list(filters: HotelFilters = {}): Promise<Paginated<Hotel>> {
    const { data } = await httpClient.get<ApiSuccess<Hotel[]>>('/hotels', {
      // Los parámetros vacíos se descartan para no ensuciar la URL con
      // `?search=&city_id=`, que además invalidaría la caché innecesariamente.
      params: pruneEmpty(filters),
    })

    return {
      items: data.data,
      pagination: data.meta?.pagination ?? {
        current_page: 1,
        per_page: data.data.length,
        total: data.data.length,
        last_page: 1,
        from: data.data.length > 0 ? 1 : null,
        to: data.data.length || null,
      },
    }
  },

  /** Detalle de un hotel, con sus configuraciones de habitación. */
  async find(id: number): Promise<Hotel> {
    const { data } = await httpClient.get<ApiSuccess<Hotel>>(`/hotels/${id}`)

    return data.data
  },

  async create(payload: HotelPayload): Promise<Hotel> {
    const { data } = await httpClient.post<ApiSuccess<Hotel>>('/hotels', payload)

    return data.data
  },

  async update(id: number, payload: HotelPayload): Promise<Hotel> {
    const { data } = await httpClient.put<ApiSuccess<Hotel>>(
      `/hotels/${id}`,
      payload,
    )

    return data.data
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/hotels/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Configuración de habitaciones
// ---------------------------------------------------------------------------

export const roomService = {
  async list(hotelId: number): Promise<HotelRoom[]> {
    const { data } = await httpClient.get<ApiSuccess<HotelRoom[]>>(
      `/hotels/${hotelId}/rooms`,
    )

    return data.data
  },

  async assign(hotelId: number, payload: RoomPayload): Promise<HotelRoom> {
    const { data } = await httpClient.post<ApiSuccess<HotelRoom>>(
      `/hotels/${hotelId}/rooms`,
      payload,
    )

    return data.data
  },

  async update(
    hotelId: number,
    roomId: number,
    payload: RoomPayload,
  ): Promise<HotelRoom> {
    const { data } = await httpClient.put<ApiSuccess<HotelRoom>>(
      `/hotels/${hotelId}/rooms/${roomId}`,
      payload,
    )

    return data.data
  },

  async remove(hotelId: number, roomId: number): Promise<void> {
    await httpClient.delete(`/hotels/${hotelId}/rooms/${roomId}`)
  },
}

/**
 * Descarta las claves sin valor de un objeto de parámetros.
 *
 * `0` y `false` se conservan: son valores legítimos, y filtrarlos con una
 * comprobación de veracidad sería un error clásico.
 */
function pruneEmpty<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  ) as Partial<T>
}
