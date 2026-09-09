import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  useAllowedAccommodations,
  useRoomTypes,
} from '@/features/catalogs/hooks/useCatalogs'
import {
  emptyRoomForm,
  roomSchema,
  type RoomFormValues,
} from '@/features/rooms/schemas/roomSchema'
import type { Hotel, HotelRoom, RoomPayload } from '@/shared/api/types'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { Field } from '@/shared/components/Field'
import { controlClasses } from '@/shared/utils/formControls'
import { useServerErrors } from '@/shared/hooks/useServerErrors'

interface RoomFormProps {
  hotel: Hotel
  /** Configuración a editar; si se omite, se está creando una nueva. */
  room?: HotelRoom
  /** Configuraciones ya existentes, para no ofrecer combinaciones repetidas. */
  existingRooms: HotelRoom[]
  isSubmitting: boolean
  onSubmit: (payload: RoomPayload) => Promise<void>
  onCancel: () => void
}

/**
 * Formulario de configuración de habitaciones.
 *
 * Es donde la interfaz hace visibles las tres reglas del enunciado, cada una
 * con la estrategia que le corresponde:
 *
 *   1. **Acomodación válida para el tipo.** Al elegir un tipo, el segundo
 *      selector se repuebla con las acomodaciones que ese tipo admite. Una
 *      combinación inválida no puede llegar a elegirse.
 *
 *   2. **Sin combinaciones repetidas.** Las acomodaciones ya configuradas para
 *      ese tipo aparecen deshabilitadas y explicadas, en lugar de dejar que el
 *      usuario las elija y reciba un error.
 *
 *   3. **Sin superar el máximo.** Se muestra cuántas habitaciones quedan y el
 *      campo de cantidad lo refleja, pero la comprobación firme es la del
 *      servidor: sólo él conoce el estado real si dos personas trabajan a la
 *      vez.
 *
 * La primera regla no está codificada aquí. Se lee de lo que el servidor
 * declara para cada tipo, de modo que la interfaz no puede contradecirlo.
 */
export function RoomForm({
  hotel,
  room,
  existingRooms,
  isSubmitting,
  onSubmit,
  onCancel,
}: RoomFormProps) {
  const { data: roomTypes = [], isLoading: loadingTypes } = useRoomTypes()
  const isEditing = room !== undefined

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: room
      ? {
          room_type_id: room.room_type?.id ?? 0,
          accommodation_id: room.accommodation?.id ?? 0,
          quantity: room.quantity,
        }
      : emptyRoomForm,
    mode: 'onBlur',
  })

  const { generalError, applyServerErrors, clearGeneralError } =
    useServerErrors<RoomFormValues>(setError)

  // El tipo seleccionado gobierna las opciones de acomodación, así que hay que
  // observarlo en lugar de leerlo sólo al enviar.
  const selectedTypeId = useWatch({ control, name: 'room_type_id' })
  const selectedAccommodationId = useWatch({ control, name: 'accommodation_id' })

  const { accommodations } = useAllowedAccommodations(selectedTypeId || null)

  /*
   * Al cambiar de tipo, la acomodación elegida puede dejar de ser válida:
   * quien tenía "Triple" con Junior y pasa a Estándar arrastraría una
   * combinación que el servidor rechazaría. Se limpia la selección para que el
   * usuario elija de nuevo entre las opciones que sí corresponden.
   */
  useEffect(() => {
    if (!selectedTypeId || !selectedAccommodationId) return

    const stillValid = accommodations.some(
      (accommodation) => accommodation.id === selectedAccommodationId,
    )

    if (!stillValid) {
      setValue('accommodation_id', 0, { shouldValidate: false })
    }
  }, [selectedTypeId, selectedAccommodationId, accommodations, setValue])

  /**
   * Determina si una acomodación ya está configurada para el tipo elegido.
   *
   * Al editar se excluye la propia configuración: en caso contrario se
   * detectaría a sí misma como duplicada y quedaría deshabilitada la única
   * opción que el usuario está intentando conservar.
   */
  const isAlreadyConfigured = (accommodationId: number): boolean =>
    existingRooms.some(
      (existing) =>
        existing.room_type?.id === selectedTypeId &&
        existing.accommodation?.id === accommodationId &&
        existing.id !== room?.id,
    )

  /*
   * Habitaciones disponibles para esta operación.
   *
   * Al editar, la cantidad actual de la configuración vuelve al saldo, porque
   * va a ser reemplazada y no debe contarse dos veces.
   */
  const availableForThisEntry =
    hotel.available_rooms + (isEditing ? room.quantity : 0)

  const submit = handleSubmit(async (values) => {
    clearGeneralError()

    try {
      await onSubmit(values)
    } catch (error) {
      applyServerErrors(error)
    }
  })

  const noCapacityLeft = availableForThisEntry === 0

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {generalError && <Alert tone="error">{generalError}</Alert>}

      {noCapacityLeft && (
        <Alert tone="warning" title="Sin capacidad disponible">
          El hotel ya tiene configuradas sus {hotel.max_rooms} habitaciones.
          Elimine o reduzca alguna configuración para poder añadir otra.
        </Alert>
      )}

      <Field label="Tipo de habitación" error={errors.room_type_id?.message} required>
        {(props) => (
          <select
            {...props}
            {...register('room_type_id', { valueAsNumber: true })}
            disabled={loadingTypes || noCapacityLeft}
            className={controlClasses(Boolean(errors.room_type_id))}
          >
            <option value={0}>
              {loadingTypes ? 'Cargando tipos…' : 'Seleccione un tipo'}
            </option>
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field
        label="Acomodación"
        error={errors.accommodation_id?.message}
        hint={
          selectedTypeId
            ? 'Sólo se muestran las acomodaciones válidas para el tipo elegido.'
            : 'Seleccione primero un tipo de habitación.'
        }
        required
      >
        {(props) => (
          <select
            {...props}
            {...register('accommodation_id', { valueAsNumber: true })}
            disabled={!selectedTypeId || noCapacityLeft}
            className={controlClasses(Boolean(errors.accommodation_id))}
          >
            <option value={0}>
              {selectedTypeId
                ? 'Seleccione una acomodación'
                : 'Elija un tipo primero'}
            </option>
            {accommodations.map((accommodation) => {
              const configured = isAlreadyConfigured(accommodation.id)

              return (
                <option
                  key={accommodation.id}
                  value={accommodation.id}
                  disabled={configured}
                >
                  {accommodation.name}
                  {configured ? ' — ya configurada' : ''}
                </option>
              )
            })}
          </select>
        )}
      </Field>

      <Field
        label="Cantidad de habitaciones"
        error={errors.quantity?.message}
        hint={`Quedan ${availableForThisEntry} habitaciones disponibles de ${hotel.max_rooms}.`}
        required
      >
        {(props) => (
          <input
            {...props}
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            min={1}
            // El máximo del campo es una ayuda, no una garantía: el servidor
            // revalida siempre, porque entre que se carga la página y se envía
            // el formulario otra persona pudo ocupar esas habitaciones.
            max={availableForThisEntry || undefined}
            disabled={noCapacityLeft}
            className={controlClasses(Boolean(errors.quantity))}
          />
        )}
      </Field>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={noCapacityLeft}>
          {isEditing ? 'Guardar cambios' : 'Asignar habitaciones'}
        </Button>
      </div>
    </form>
  )
}
