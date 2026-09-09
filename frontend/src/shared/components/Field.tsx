import type { ReactNode } from 'react'
import { useId } from 'react'

interface FieldProps {
  label: string
  /** Mensaje de error a mostrar; si existe, el campo se marca como inválido. */
  error?: string
  /** Texto de ayuda que se muestra cuando no hay error. */
  hint?: string
  required?: boolean
  /** Recibe los atributos que deben aplicarse al control. */
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => ReactNode
}

/**
 * Envoltorio de un campo de formulario: etiqueta, control, ayuda y error.
 *
 * Resuelve el cableado de accesibilidad que suele omitirse y que, sin él, deja
 * el formulario inutilizable con lector de pantalla:
 *
 *   - `htmlFor` e `id` enlazan etiqueta y control, de modo que pulsar la
 *     etiqueta enfoca el campo y el lector anuncia de qué se trata.
 *   - `aria-describedby` asocia el mensaje de error al control, para que se
 *     anuncie al llegar a él y no quede como texto suelto en la página.
 *   - `aria-invalid` comunica el estado de error sin depender del color, que
 *     no percibe todo el mundo.
 *
 * Se usa el patrón de función como hijo para que estos atributos lleguen al
 * control real, sea un input, un select o un componente propio.
 */
export function Field({ label, error, hint, required, children }: FieldProps) {
  // `useId` genera identificadores únicos y estables, sin colisiones aunque el
  // mismo campo se renderice dos veces en la pantalla.
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}

      {error ? (
        <p
          id={errorId}
          // `role="alert"` hace que el lector de pantalla anuncie el error en
          // cuanto aparece, sin esperar a que el usuario navegue hasta él.
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

