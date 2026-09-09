import { z } from 'zod'

/**
 * Validación del formulario de hoteles.
 *
 * Es el espejo deliberado de `StoreHotelRequest` en el backend. La duplicación
 * es intencionada y no contradice el principio de no repetirse: cumplen
 * funciones distintas.
 *
 *   - Esta validación existe para la experiencia de uso: avisa al escribir, sin
 *     ida y vuelta al servidor.
 *   - La del backend existe para la integridad: es la única que no puede
 *     saltarse, porque el cliente es código que el usuario controla.
 *
 * Lo que nunca se duplica aquí son las reglas que dependen del estado del
 * sistema —si el NIT ya existe, si la acomodación corresponde al tipo, si cabe
 * en el máximo—: ésas sólo el servidor puede responderlas, y sus errores se
 * muestran tal como llegan.
 */

/**
 * NIT colombiano: de 6 a 15 dígitos con dígito de verificación opcional.
 *
 * Se valida como texto y no como número porque puede llevar ceros a la
 * izquierda, que un tipo numérico perdería.
 */
const NIT_PATTERN = /^\d{6,15}(-\d)?$/

export const hotelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre del hotel debe tener al menos 3 caracteres.')
    .max(150, 'El nombre no puede superar los 150 caracteres.'),

  address: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres.')
    .max(200, 'La dirección no puede superar los 200 caracteres.'),

  city_id: z
    .number({ message: 'Debe seleccionar la ciudad del hotel.' })
    .int()
    .positive('Debe seleccionar la ciudad del hotel.'),

  nit: z
    .string()
    .trim()
    .regex(
      NIT_PATTERN,
      'El NIT debe contener sólo dígitos, con un dígito de verificación opcional tras un guion. Ejemplo: 12345678-9.',
    ),

  max_rooms: z
    .number({ message: 'Debe indicar el número máximo de habitaciones.' })
    .int('El número de habitaciones debe ser un número entero.')
    .min(1, 'El hotel debe tener al menos una habitación.')
    .max(10000, 'El número de habitaciones no puede superar 10.000.'),
})

export type HotelFormValues = z.infer<typeof hotelSchema>

/** Valores iniciales de un formulario de alta. */
export const emptyHotelForm: HotelFormValues = {
  name: '',
  address: '',
  city_id: 0,
  nit: '',
  max_rooms: 1,
}
