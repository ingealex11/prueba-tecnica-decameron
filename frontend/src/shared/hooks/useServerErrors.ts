import { useCallback, useState } from 'react'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { ApiRequestError } from '@/shared/api/client'

/**
 * Traslada los errores del servidor al formulario.
 *
 * Es la pieza que hace que la validación del backend se sienta parte de la
 * interfaz. El servidor devuelve los errores agrupados por campo con el mismo
 * formato tanto si provienen de la validación de entrada como de una regla de
 * negocio, así que un único bloque de código los coloca todos junto al input
 * que les corresponde.
 *
 * Lo que no encaja en ningún campo —un conflicto, un fallo de red— se expone
 * por separado para mostrarlo como aviso general: descartarlo dejaría al
 * usuario ante un formulario que no hace nada y no dice por qué.
 */
export function useServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
) {
  const [generalError, setGeneralError] = useState<string | null>(null)

  const applyServerErrors = useCallback(
    (error: unknown) => {
      if (!(error instanceof ApiRequestError)) {
        setGeneralError(
          'Ocurrió un error inesperado. Intente de nuevo en unos momentos.',
        )
        return
      }

      // Los errores por campo se colocan sobre sus inputs.
      for (const [field, messages] of Object.entries(error.fieldErrors)) {
        setError(field as Path<T>, {
          type: 'server',
          message: messages[0],
        })
      }

      // El mensaje general se muestra sólo cuando no hay errores por campo, o
      // cuando aporta contexto que los mensajes individuales no recogen (como
      // el número de habitaciones disponibles restantes). Duplicarlo siempre
      // haría que el mismo texto apareciera dos veces en pantalla.
      setGeneralError(error.hasFieldErrors ? null : error.message)
    },
    [setError],
  )

  const clearGeneralError = useCallback(() => setGeneralError(null), [])

  return { generalError, applyServerErrors, clearGeneralError }
}

/**
 * Extrae un mensaje legible de cualquier error, para mostrarlo fuera de un
 * formulario.
 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado.'
}
