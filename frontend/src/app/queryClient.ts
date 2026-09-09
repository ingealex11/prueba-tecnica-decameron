import { QueryClient } from '@tanstack/react-query'

import { ApiRequestError } from '@/shared/api/client'

/**
 * Cliente de consultas de la aplicación.
 *
 * La política de reintentos es la decisión importante de este archivo. Por
 * defecto TanStack Query reintenta tres veces cualquier consulta fallida, lo
 * que en una API REST es contraproducente: reintentar un 404 o un 422 no puede
 * cambiar el resultado, sólo retrasa el mensaje de error y multiplica la carga
 * del servidor.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiRequestError) {
          // Los errores del cliente (4xx) son deterministas: la misma petición
          // volverá a fallar igual. La excepción es 429, donde esperar sí
          // ayuda, pero de eso ya se encarga el retardo progresivo.
          if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            return false
          }
        }

        // Los fallos de red y los 5xx sí pueden ser transitorios.
        return failureCount < 2
      },

      // Retardo creciente, para no insistir sobre un servidor que ya va justo.
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),

      // Treinta segundos de vigencia: suficiente para que moverse entre
      // pantallas no relance las mismas consultas, y lo bastante corto para no
      // mostrar datos obsoletos en una herramienta de trabajo compartida.
      staleTime: 30_000,

      // Refrescar al volver a la pestaña es deseable en datos compartidos: otra
      // persona pudo cambiar la configuración mientras tanto.
      refetchOnWindowFocus: true,
    },

    mutations: {
      // Las escrituras nunca se reintentan solas: un reintento automático de un
      // POST podría crear el recurso dos veces si la primera petición llegó a
      // ejecutarse y sólo se perdió la respuesta.
      retry: false,
    },
  },
})
