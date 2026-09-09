import { describe, expect, it } from 'vitest'

import { hotelSchema } from '@/features/hotels/schemas/hotelSchema'

/*
|-----------------------------------------------------------------------------
| Validación del formulario de hoteles
|-----------------------------------------------------------------------------
|
| Estas reglas son el espejo de `StoreHotelRequest` en el backend. Probarlas por
| separado tiene sentido porque cumplen una función distinta: dar respuesta
| inmediata mientras se escribe, sin ida y vuelta al servidor.
|
| Si alguna vez divergen de las del backend, el síntoma sería un formulario que
| deja enviar datos que el servidor rechaza —o al revés, que bloquea datos
| perfectamente válidos—. Estas pruebas fijan el comportamiento esperado.
|
*/

/** Hotel del ejemplo del enunciado, usado como base válida. */
const validHotel = {
  name: 'Decameron Cartagena',
  address: 'Calle 23 58-25',
  city_id: 1,
  nit: '12345678-9',
  max_rooms: 42,
}

describe('datos válidos', () => {
  it('acepta el hotel del ejemplo del enunciado', () => {
    expect(hotelSchema.safeParse(validHotel).success).toBe(true)
  })

  it('recorta los espacios sobrantes del nombre', () => {
    // Sin recortar, "  Hotel  " y "Hotel" se considerarían nombres distintos y
    // la regla de unicidad podría sortearse con sólo añadir un espacio.
    const result = hotelSchema.safeParse({
      ...validHotel,
      name: '   Decameron Cartagena   ',
    })

    expect(result.success).toBe(true)
    expect(result.success && result.data.name).toBe('Decameron Cartagena')
  })
})

describe('formato del NIT', () => {
  it.each([
    ['12345678-9', 'con dígito de verificación'],
    ['900123456-7', 'de nueve dígitos'],
    ['123456', 'en el mínimo de seis dígitos'],
    ['901456789', 'sin dígito de verificación'],
    ['012345678-1', 'con cero a la izquierda'],
  ])('acepta %s (%s)', (nit) => {
    expect(hotelSchema.safeParse({ ...validHotel, nit }).success).toBe(true)
  })

  it.each([
    ['NIT-12345', 'con letras'],
    ['12345', 'demasiado corto'],
    ['12345678-99', 'con dos dígitos de verificación'],
    ['1234 5678', 'con espacios'],
    ['', 'vacío'],
  ])('rechaza %s (%s)', (nit) => {
    expect(hotelSchema.safeParse({ ...validHotel, nit }).success).toBe(false)
  })

  it('conserva el NIT como texto y no como número', () => {
    // Tratarlo como numérico perdería los ceros a la izquierda y el guion.
    const result = hotelSchema.safeParse({ ...validHotel, nit: '012345678-1' })

    expect(result.success && result.data.nit).toBe('012345678-1')
  })
})

describe('número máximo de habitaciones', () => {
  it.each([1, 42, 10000])('acepta %i habitaciones', (max_rooms) => {
    expect(hotelSchema.safeParse({ ...validHotel, max_rooms }).success).toBe(true)
  })

  it.each([
    [0, 'cero'],
    [-5, 'negativo'],
    [10001, 'por encima del tope'],
    [42.5, 'no entero'],
  ])('rechaza %i (%s)', (max_rooms) => {
    expect(hotelSchema.safeParse({ ...validHotel, max_rooms }).success).toBe(false)
  })
})

describe('campos obligatorios', () => {
  it('rechaza un formulario vacío señalando cada campo', () => {
    const result = hotelSchema.safeParse({})

    expect(result.success).toBe(false)

    const failedFields = result.success
      ? []
      : result.error.issues.map((issue) => issue.path[0])

    // Cada campo debe reportarse por separado para que la interfaz pueda
    // resaltar exactamente cuál falta.
    expect(failedFields).toEqual(
      expect.arrayContaining(['name', 'address', 'city_id', 'nit', 'max_rooms']),
    )
  })

  it('rechaza no haber elegido ciudad', () => {
    // El valor 0 es el marcador "Seleccione una ciudad" del desplegable.
    expect(hotelSchema.safeParse({ ...validHotel, city_id: 0 }).success).toBe(false)
  })

  it('rechaza un nombre demasiado corto', () => {
    expect(hotelSchema.safeParse({ ...validHotel, name: 'AB' }).success).toBe(false)
  })

  it('rechaza una dirección demasiado corta', () => {
    expect(hotelSchema.safeParse({ ...validHotel, address: 'C 1' }).success).toBe(false)
  })
})
