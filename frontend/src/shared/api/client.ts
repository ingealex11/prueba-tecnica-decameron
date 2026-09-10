import axios, { AxiosError, type AxiosInstance } from 'axios'

import { announceSessionExpired, session } from '@/features/auth/session'

import type { ApiError } from './types'

/**
 * Cliente HTTP de la aplicación.
 *
 * Concentra en un único punto la URL base, las cabeceras y —sobre todo— la
 * normalización de errores. Sin esto, cada componente tendría que inspeccionar
 * la forma de `error.response.data`, y bastaría con que uno lo hiciera mal para
 * que un fallo del servidor se mostrara al usuario como "undefined".
 */

/**
 * URL base de la API.
 *
 * Se toma de una variable de entorno para que el mismo código compile contra
 * el backend local en desarrollo y contra el desplegado en producción. El valor
 * por defecto es el del servidor de desarrollo de Laravel.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Fuerza la negociación JSON: sin esta cabecera el backend podría
    // responder errores en HTML, inservibles para el cliente.
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  // Un tope explícito evita que una petición colgada deje la interfaz en estado
  // de carga indefinidamente.
  timeout: 15_000,
})

/**
 * Error normalizado que consume toda la aplicación.
 *
 * Extiende `Error` para conservar la traza y el comportamiento estándar, y
 * añade la información estructurada que envía el backend.
 */
export class ApiRequestError extends Error {
  /** Código estable de la regla violada; útil para reaccionar por caso. */
  readonly code: ApiError['error_code'] | 'NETWORK_ERROR'

  /** Código HTTP, o `0` cuando la petición nunca llegó al servidor. */
  readonly status: number

  /** Mensajes de error agrupados por campo del formulario. */
  readonly fieldErrors: Record<string, string[]>

  /** Contexto adicional, como las habitaciones disponibles restantes. */
  readonly context: Record<string, unknown>

  constructor(
    message: string,
    code: ApiError['error_code'] | 'NETWORK_ERROR',
    status: number,
    fieldErrors: Record<string, string[]> = {},
    context: Record<string, unknown> = {},
  ) {
    super(message)

    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
    this.fieldErrors = fieldErrors
    this.context = context
  }

  /** Indica si el error corresponde a un campo concreto del formulario. */
  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0
  }
}

/**
 * Interceptor de respuesta: traduce cualquier fallo a `ApiRequestError`.
 *
 * Se rechaza siempre con el mismo tipo, de modo que quien consuma el cliente
 * pueda asumirlo sin comprobaciones defensivas.
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // La petición no llegó a completarse: sin conexión, servidor caído o
    // tiempo agotado. El backend no dijo nada, así que el mensaje lo pone el
    // cliente.
    if (!error.response) {
      return Promise.reject(
        new ApiRequestError(
          'No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.',
          'NETWORK_ERROR',
          0,
        ),
      )
    }

    const { status, data } = error.response

    // Un 401 con token significa que el servidor dejó de reconocerlo: caducó
    // o se revocó desde otro dispositivo. Se avisa para que la aplicación
    // limpie la sesión y vuelva al inicio de sesión. Se excluyen las rutas de
    // autenticación: un 401 al iniciar sesión es "credenciales incorrectas",
    // no "sesión caducada".
    const isAuthRoute = (error.config?.url ?? '').includes('/auth/')
    if (status === 401 && session.token() && !isAuthRoute) {
      announceSessionExpired()
    }

    // El servidor respondió, pero no con la envoltura esperada. Ocurre, por
    // ejemplo, si un proxy intermedio devuelve su propia página de error.
    if (!data || typeof data !== 'object' || !('error_code' in data)) {
      return Promise.reject(
        new ApiRequestError(
          'El servidor devolvió una respuesta inesperada.',
          'INTERNAL_SERVER_ERROR',
          status,
        ),
      )
    }

    return Promise.reject(
      new ApiRequestError(
        data.message,
        data.error_code,
        status,
        data.errors ?? {},
        data.meta ?? {},
      ),
    )
  },
)

/**
 * Adjunta el token de la sesión a cada petición.
 *
 * Se lee del almacén de sesión en cada petición, no una sola vez al crear el
 * cliente: así el token recién obtenido al iniciar sesión se usa de inmediato
 * sin recrear nada, y al cerrar sesión deja de enviarse al instante.
 */
httpClient.interceptors.request.use((config) => {
  const token = session.token() ?? import.meta.env.VITE_API_TOKEN

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
