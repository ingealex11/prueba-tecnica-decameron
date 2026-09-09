import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useCities } from '@/features/catalogs/hooks/useCatalogs'
import {
  emptyHotelForm,
  hotelSchema,
  type HotelFormValues,
} from '@/features/hotels/schemas/hotelSchema'
import type { Hotel, HotelPayload } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { Field } from '@/shared/components/Field'
import { controlClasses } from '@/shared/utils/formControls'
import { useServerErrors } from '@/shared/hooks/useServerErrors'

interface HotelFormProps {
  /** Hotel a editar; si se omite, el formulario es de alta. */
  hotel?: Hotel
  isSubmitting: boolean
  onSubmit: (payload: HotelPayload) => Promise<void>
  onCancel: () => void
}

/**
 * Formulario de alta y edición de hoteles.
 *
 * Un mismo componente cubre ambos casos porque los campos y las reglas son
 * idénticos; lo único que cambia son los valores iniciales y el texto del
 * botón. Duplicarlo en dos componentes obligaría a recordar cambiar los dos
 * cada vez que el formulario evolucionara.
 */
export function HotelForm({
  hotel,
  isSubmitting,
  onSubmit,
  onCancel,
}: HotelFormProps) {
  const { data: cities = [], isLoading: loadingCities } = useCities()
  const isEditing = hotel !== undefined

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: hotel
      ? {
          name: hotel.name,
          address: hotel.address,
          city_id: hotel.city?.id ?? 0,
          nit: hotel.nit,
          max_rooms: hotel.max_rooms,
        }
      : emptyHotelForm,
    // Valida al salir del campo en lugar de en cada pulsación: avisar mientras
    // se escribe marca en rojo un NIT a medio teclear, lo que resulta hostil.
    mode: 'onBlur',
  })

  const { generalError, applyServerErrors, clearGeneralError } =
    useServerErrors<HotelFormValues>(setError)

  // Repuebla el formulario si cambia el hotel que se está editando, algo que
  // ocurre cuando se cierra el diálogo y se abre sobre otra fila.
  useEffect(() => {
    if (hotel) {
      reset({
        name: hotel.name,
        address: hotel.address,
        city_id: hotel.city?.id ?? 0,
        nit: hotel.nit,
        max_rooms: hotel.max_rooms,
      })
    }
  }, [hotel, reset])

  const submit = handleSubmit(async (values) => {
    clearGeneralError()

    try {
      await onSubmit(values)
    } catch (error) {
      // Las reglas que dependen del estado del sistema —NIT ya registrado,
      // máximo por debajo de lo configurado— sólo el servidor puede evaluarlas.
      applyServerErrors(error)
    }
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {generalError && <Alert tone="error">{generalError}</Alert>}

      <Field label="Nombre del hotel" error={errors.name?.message} required>
        {(props) => (
          <input
            {...props}
            {...register('name')}
            type="text"
            placeholder="Decameron Cartagena"
            autoComplete="off"
            className={controlClasses(Boolean(errors.name))}
          />
        )}
      </Field>

      <Field label="Dirección" error={errors.address?.message} required>
        {(props) => (
          <input
            {...props}
            {...register('address')}
            type="text"
            placeholder="Calle 23 58-25"
            autoComplete="off"
            className={controlClasses(Boolean(errors.address))}
          />
        )}
      </Field>

      {/* En pantallas estrechas los campos se apilan; desde tableta van en dos
          columnas, que es como mejor aprovechan el ancho de un portátil. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ciudad" error={errors.city_id?.message} required>
          {(props) => (
            <select
              {...props}
              {...register('city_id', { valueAsNumber: true })}
              disabled={loadingCities}
              className={controlClasses(Boolean(errors.city_id))}
            >
              <option value={0}>
                {loadingCities ? 'Cargando ciudades…' : 'Seleccione una ciudad'}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          label="NIT"
          error={errors.nit?.message}
          hint="Con dígito de verificación. Ejemplo: 12345678-9"
          required
        >
          {(props) => (
            <input
              {...props}
              {...register('nit')}
              type="text"
              placeholder="12345678-9"
              // `inputMode` hace que en móvil aparezca el teclado numérico sin
              // impedir escribir el guion, cosa que `type="number"` sí haría.
              inputMode="numeric"
              autoComplete="off"
              className={controlClasses(Boolean(errors.nit))}
            />
          )}
        </Field>
      </div>

      <Field
        label="Número máximo de habitaciones"
        error={errors.max_rooms?.message}
        hint={
          isEditing
            ? 'No puede quedar por debajo de las habitaciones ya configuradas.'
            : 'Capacidad física del inmueble.'
        }
        required
      >
        {(props) => (
          <input
            {...props}
            {...register('max_rooms', { valueAsNumber: true })}
            type="number"
            min={1}
            max={10000}
            className={controlClasses(Boolean(errors.max_rooms))}
          />
        )}
      </Field>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Guardar cambios' : 'Registrar hotel'}
        </Button>
      </div>
    </form>
  )
}
