import { z } from 'zod'

/**
 * Validación del formulario de configuración de habitaciones.
 *
 * Comprueba únicamente la forma de los datos. Las tres reglas del enunciado
 * —acomodación válida para el tipo, combinación no repetida y cantidad dentro
 * del máximo— no se replican aquí:
 *
 *   - La correspondencia tipo/acomodación se refleja en la interfaz limitando
 *     las opciones del selector a las que el servidor declara válidas, de modo
 *     que una combinación incorrecta ni siquiera puede elegirse.
 *   - Las otras dos dependen del estado actual del hotel, que sólo el servidor
 *     conoce con certeza. Adivinarlas en el cliente daría respuestas erróneas
 *     en cuanto dos personas trabajaran a la vez.
 */
export const roomSchema = z.object({
  room_type_id: z
    .number({ message: 'Debe seleccionar el tipo de habitación.' })
    .int()
    .positive('Debe seleccionar el tipo de habitación.'),

  accommodation_id: z
    .number({ message: 'Debe seleccionar la acomodación.' })
    .int()
    .positive('Debe seleccionar la acomodación.'),

  quantity: z
    .number({ message: 'Debe indicar la cantidad de habitaciones.' })
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad debe ser al menos 1.')
    .max(10000, 'La cantidad no puede superar 10.000.'),
})

export type RoomFormValues = z.infer<typeof roomSchema>

export const emptyRoomForm: RoomFormValues = {
  room_type_id: 0,
  accommodation_id: 0,
  quantity: 1,
}
