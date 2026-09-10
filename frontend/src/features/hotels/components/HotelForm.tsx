import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useCities } from '@/features/catalogs/hooks/useCatalogs'
import { emptyHotelForm, hotelSchema, type HotelFormValues } from '@/features/hotels/schemas/hotelSchema'
import type { Hotel, HotelPayload } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { Field } from '@/shared/components/Field'
import { MapPicker } from '@/shared/components/map/MapPicker'
import { useServerErrors } from '@/shared/hooks/useServerErrors'
import { controlClasses } from '@/shared/utils/formControls'

interface HotelFormProps {
  /** Hotel a editar; si se omite, el formulario es de alta. */
  hotel?: Hotel
  isSubmitting: boolean
  onSubmit: (payload: HotelPayload) => Promise<void>
  onCancel: () => void
}

function toFormValues(hotel?: Hotel): HotelFormValues {
  if (!hotel) return emptyHotelForm

  return {
    name: hotel.name,
    address: hotel.address,
    city_id: hotel.city?.id ?? 0,
    nit: hotel.nit,
    max_rooms: hotel.max_rooms,
    location: hotel.location,
  }
}

/**
 * Formulario de alta y edición de hoteles.
 *
 * Un mismo componente cubre ambos casos porque los campos y las reglas son
 * idénticos; lo único que cambia son los valores iniciales y el texto del
 * botón. La ubicación se elige sobre un mapa y es opcional: un hotel debe
 * poder registrarse aunque aún no se sepa situarlo con exactitud.
 */
export function HotelForm({ hotel, isSubmitting, onSubmit, onCancel }: HotelFormProps) {
  const { data: cities = [], isLoading: loadingCities } = useCities()
  const isEditing = hotel !== undefined

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: toFormValues(hotel),
    // Valida al salir del campo en lugar de en cada pulsación: avisar mientras
    // se escribe marca en rojo un NIT a medio teclear, lo que resulta hostil.
    mode: 'onBlur',
  })

  const { generalError, applyServerErrors, clearGeneralError } = useServerErrors<HotelFormValues>(setError)

  // Repuebla el formulario si cambia el hotel que se está editando.
  useEffect(() => {
    if (hotel) reset(toFormValues(hotel))
  }, [hotel, reset])

  // Dirección y ciudad escritas, para buscarlas en el mapa.
  const address = useWatch({ control, name: 'address' })
  const cityId = useWatch({ control, name: 'city_id' })
  const cityName = cities.find((c) => c.id === cityId)?.name
  const addressQuery = [address, cityName].filter(Boolean).join(', ')

  const submit = handleSubmit(async ({ location, ...values }) => {
    clearGeneralError()

    try {
      await onSubmit({
        ...values,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      })
    } catch (error) {
      // Las reglas que dependen del estado del sistema —NIT ya registrado,
      // máximo por debajo de lo configurado— sólo el servidor puede evaluarlas.
      applyServerErrors(error)
    }
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {generalError && <Alert tone="error">{generalError}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="eyebrow">Datos del hotel</p>

          <Field label="Nombre del hotel" error={errors.name?.message} required>
            {(props) => (
              <input {...props} {...register('name')} type="text" placeholder="Decameron Cartagena" autoComplete="off" className={controlClasses(Boolean(errors.name))} />
            )}
          </Field>

          <Field label="Dirección" error={errors.address?.message} required>
            {(props) => (
              <input {...props} {...register('address')} type="text" placeholder="Calle 23 58-25" autoComplete="off" className={controlClasses(Boolean(errors.address))} />
            )}
          </Field>

          <Field label="Ciudad" error={errors.city_id?.message} required>
            {(props) => (
              <select {...props} {...register('city_id', { valueAsNumber: true })} disabled={loadingCities} className={controlClasses(Boolean(errors.city_id))}>
                <option value={0}>{loadingCities ? 'Cargando ciudades…' : 'Seleccione una ciudad'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="NIT" error={errors.nit?.message} hint="Ejemplo: 12345678-9" required>
              {(props) => (
                <input {...props} {...register('nit')} type="text" placeholder="12345678-9" inputMode="numeric" autoComplete="off" className={controlClasses(Boolean(errors.nit))} />
              )}
            </Field>

            <Field
              label="Máximo de habitaciones"
              error={errors.max_rooms?.message}
              hint={isEditing ? 'No puede quedar por debajo de las ya configuradas.' : 'Capacidad física del inmueble.'}
              required
            >
              {(props) => (
                <input {...props} {...register('max_rooms', { valueAsNumber: true })} type="number" min={1} max={10000} className={controlClasses(Boolean(errors.max_rooms))} />
              )}
            </Field>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="eyebrow">Ubicación en el mapa</p>
            <p className="mt-1 text-[0.8125rem] text-ink-3">Opcional. Permite mostrar el hotel en el mapa de sedes.</p>
          </div>

          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <MapPicker value={field.value ?? null} onChange={field.onChange} addressQuery={addressQuery} />
            )}
          />
          {errors.location?.message && <p role="alert" className="text-[0.8125rem] text-danger">{errors.location.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" isLoading={isSubmitting}>{isEditing ? 'Guardar cambios' : 'Registrar hotel'}</Button>
      </div>
    </form>
  )
}
