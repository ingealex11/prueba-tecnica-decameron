import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { ApiRequestError, httpClient } from '@/shared/api/client'
import type { ApiError } from '@/shared/api/types'

/*
|-----------------------------------------------------------------------------
| Cliente HTTP
|-----------------------------------------------------------------------------
|
| El interceptor de errores es una pieza pequeña de la que depende toda la
| interfaz: si deja escapar un error sin normalizar, el usuario acaba viendo
| "undefined" en lugar de un mensaje.
|
| Las pruebas ejercitan directamente el manejador de rechazo registrado en el
| cliente, en lugar de levantar un servidor: lo que se quiere verificar es la
| traducción de la respuesta, no el transporte.
|
*/

/** Obtiene el manejador de error que el cliente tiene registrado. */
function rejectionHandler(): (error: AxiosError<ApiError>) => Promise<never> {
  const interceptor = (
    httpClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError<ApiError>) => Promise<never> }>
    }
  ).handlers[0]

  return interceptor.rejected
}

/** Construye un error de Axios con la respuesta indicada. */
function axiosErrorWith(status: number, data: unknown): AxiosError<ApiError> {
  const error = new AxiosError<ApiError>('Request failed')

  error.response = {
    status,
    statusText: '',
    data: data as ApiError,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }

  return error
}

describe('normalización de errores de la API', () => {
  it('traduce una violación de regla de negocio conservando su contexto', async () => {
    const handler = rejectionHandler()

    const payload: ApiError = {
      success: false,
      message: 'No se pueden configurar 50 habitaciones: sólo quedan 5.',
      error_code: 'ROOM_CAPACITY_EXCEEDED',
      errors: { quantity: ['No se pueden configurar 50 habitaciones.'] },
      meta: { available_rooms: 5, max_rooms: 42 },
    }

    await expect(handler(axiosErrorWith(422, payload))).rejects.toSatisfy(
      (error: unknown) => {
        expect(error).toBeInstanceOf(ApiRequestError)

        const apiError = error as ApiRequestError
        expect(apiError.code).toBe('ROOM_CAPACITY_EXCEEDED')
        expect(apiError.status).toBe(422)
        expect(apiError.fieldErrors).toHaveProperty('quantity')
        expect(apiError.hasFieldErrors).toBe(true)
        // El contexto es lo que permite a la interfaz decir cuántas quedan.
        expect(apiError.context.available_rooms).toBe(5)

        return true
      },
    )
  })

  it('distingue un conflicto sin errores por campo', async () => {
    const handler = rejectionHandler()

    const payload: ApiError = {
      success: false,
      message: 'Esa configuración ya existe en el hotel.',
      error_code: 'DUPLICATE_ROOM_CONFIGURATION',
    }

    try {
      await handler(axiosErrorWith(409, payload))
      expect.unreachable('Se esperaba un rechazo.')
    } catch (error) {
      const apiError = error as ApiRequestError

      expect(apiError.status).toBe(409)
      expect(apiError.hasFieldErrors).toBe(false)
      expect(apiError.fieldErrors).toEqual({})
    }
  })

  it('produce un mensaje propio cuando la petición no llega al servidor', async () => {
    const handler = rejectionHandler()

    // Sin `response`: red caída, servidor apagado o tiempo agotado. El backend
    // no dijo nada, así que el mensaje tiene que ponerlo el cliente.
    const networkError = new AxiosError<ApiError>('Network Error')

    try {
      await handler(networkError)
      expect.unreachable('Se esperaba un rechazo.')
    } catch (error) {
      const apiError = error as ApiRequestError

      expect(apiError.code).toBe('NETWORK_ERROR')
      expect(apiError.status).toBe(0)
      expect(apiError.message).toMatch(/no se pudo conectar/i)
    }
  })

  it('resiste una respuesta que no sigue el contrato de la API', async () => {
    const handler = rejectionHandler()

    // Ocurre cuando un proxy o un balanceador intermedio devuelve su propia
    // página de error en lugar del JSON del backend.
    try {
      await handler(axiosErrorWith(502, '<html>Bad Gateway</html>'))
      expect.unreachable('Se esperaba un rechazo.')
    } catch (error) {
      const apiError = error as ApiRequestError

      expect(apiError).toBeInstanceOf(ApiRequestError)
      expect(apiError.status).toBe(502)
      expect(apiError.message).toMatch(/respuesta inesperada/i)
    }
  })

  it('conserva el comportamiento estándar de Error', () => {
    const error = new ApiRequestError('Mensaje', 'NOT_FOUND', 404)

    // Extender Error correctamente importa: si el prototipo se rompe, los
    // `instanceof` de la aplicación dejan de funcionar en silencio.
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiRequestError')
    expect(error.message).toBe('Mensaje')
  })
})
