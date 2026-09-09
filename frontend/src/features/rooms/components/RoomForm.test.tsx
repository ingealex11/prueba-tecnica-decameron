import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RoomForm } from '@/features/rooms/components/RoomForm'
import { catalogService } from '@/shared/api/services'
import { makeHotel, makeRoom, roomTypes } from '@/test/fixtures'
import { renderWithProviders } from '@/test/utils'

/*
|-----------------------------------------------------------------------------
| Formulario de configuración de habitaciones
|-----------------------------------------------------------------------------
|
| La prueba central del frontend: verificar que la interfaz hace cumplir la
| regla del enunciado sobre qué acomodación admite cada tipo de habitación.
|
| Se prueba a través de lo que ve el usuario —las opciones disponibles en el
| desplegable— y no del estado interno del componente. Una prueba atada al
| estado interno se rompe al reorganizar el código aunque el comportamiento sea
| idéntico, y deja de romperse cuando el comportamiento cambia pero el estado
| no. Aquí lo que se afirma es lo que el gerente puede o no puede elegir.
|
*/

// El catálogo lo sirve el backend; en una prueba de componente se sustituye por
// datos fijos para no depender de que haya un servidor levantado.
vi.mock('@/shared/api/services', () => ({
  catalogService: {
    roomTypes: vi.fn(),
    cities: vi.fn(),
    accommodations: vi.fn(),
  },
}))

const mockedCatalog = vi.mocked(catalogService)

beforeEach(() => {
  vi.clearAllMocks()
  mockedCatalog.roomTypes.mockResolvedValue(roomTypes)
})

/** Devuelve los textos de las opciones del desplegable de acomodación. */
async function accommodationOptions(): Promise<string[]> {
  const select = screen.getByLabelText(/acomodación/i)

  return within(select)
    .getAllByRole('option')
    .slice(1) // se descarta el marcador "Seleccione…"
    .map((option) => option.textContent?.trim() ?? '')
}

function renderForm(props: Partial<Parameters<typeof RoomForm>[0]> = {}) {
  return renderWithProviders(
    <RoomForm
      hotel={makeHotel()}
      existingRooms={[]}
      isSubmitting={false}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  )
}

describe('regla de acomodación por tipo de habitación', () => {
  it('ofrece sólo Sencilla y Doble para Estándar', async () => {
    const user = userEvent.setup()
    renderForm()

    await waitFor(() =>
      expect(screen.getByLabelText(/tipo de habitación/i)).toBeEnabled(),
    )

    await user.selectOptions(screen.getByLabelText(/tipo de habitación/i), '1')

    await waitFor(async () =>
      expect(await accommodationOptions()).toEqual(['Sencilla', 'Doble']),
    )
  })

  it('ofrece sólo Triple y Cuádruple para Junior', async () => {
    const user = userEvent.setup()
    renderForm()

    await waitFor(() =>
      expect(screen.getByLabelText(/tipo de habitación/i)).toBeEnabled(),
    )

    await user.selectOptions(screen.getByLabelText(/tipo de habitación/i), '2')

    await waitFor(async () =>
      expect(await accommodationOptions()).toEqual(['Triple', 'Cuádruple']),
    )
  })

  it('ofrece Sencilla, Doble y Triple para Suite, pero nunca Cuádruple', async () => {
    const user = userEvent.setup()
    renderForm()

    await waitFor(() =>
      expect(screen.getByLabelText(/tipo de habitación/i)).toBeEnabled(),
    )

    await user.selectOptions(screen.getByLabelText(/tipo de habitación/i), '3')

    await waitFor(async () => {
      const options = await accommodationOptions()

      expect(options).toEqual(['Sencilla', 'Doble', 'Triple'])
      expect(options).not.toContain('Cuádruple')
    })
  })

  it('mantiene bloqueada la acomodación hasta elegir un tipo', async () => {
    renderForm()

    await waitFor(() =>
      expect(screen.getByLabelText(/tipo de habitación/i)).toBeEnabled(),
    )

    // Sin tipo elegido no hay regla que aplicar, así que ofrecer acomodaciones
    // sería ofrecer opciones que podrían resultar inválidas.
    expect(screen.getByLabelText(/acomodación/i)).toBeDisabled()
  })

  it('descarta la acomodación elegida si deja de ser válida al cambiar el tipo', async () => {
    const user = userEvent.setup()
    renderForm()

    await waitFor(() =>
      expect(screen.getByLabelText(/tipo de habitación/i)).toBeEnabled(),
    )

    // Junior con Triple es una combinación válida.
    await user.selectOptions(screen.getByLabelText(/tipo de habitación/i), '2')
    await waitFor(async () =>
      expect(await accommodationOptions()).toContain('Triple'),
    )
    await user.selectOptions(screen.getByLabelText(/acomodación/i), '3')
    expect(screen.getByLabelText(/acomodación/i)).toHaveValue('3')

    // Al pasar a Estándar, Triple deja de ser admisible: arrastrarla haría que
    // el servidor rechazara el envío sin que el usuario supiera por qué.
    await user.selectOptions(screen.getByLabelText(/tipo de habitación/i), '1')

    await waitFor(() =>
      expect(screen.getByLabelText(/acomodación/i)).toHaveValue('0'),
    )
  })
})

describe('regla de combinaciones no repetidas', () => {
  it('bloquea la acomodación que el hotel ya tiene configurada para ese tipo', async () => {
    const user = userEvent.setup()

    renderForm({
      existingRooms: [
        makeRoom({
          id: 5,
          room_type: roomTypes[0],
          accommodation: roomTypes[0].accommodations[0], // Estándar + Sencilla
        }),
      ],
    })

    await waitFor(() =>
      expect(screen.getByLabelText(/tipo de habitación/i)).toBeEnabled(),
    )

    await user.selectOptions(screen.getByLabelText(/tipo de habitación/i), '1')

    await waitFor(() => {
      const select = screen.getByLabelText(/acomodación/i)
      const options = within(select).getAllByRole('option')

      // Se muestra pero deshabilitada y explicada: ocultarla dejaría al usuario
      // preguntándose por qué falta una opción que el catálogo sí admite.
      const sencilla = options.find((o) => o.textContent?.includes('Sencilla'))
      const doble = options.find((o) => o.textContent?.includes('Doble'))

      expect(sencilla).toBeDisabled()
      expect(sencilla?.textContent).toContain('ya configurada')
      expect(doble).toBeEnabled()
    })
  })

  it('no bloquea la configuración que se está editando', async () => {
    const user = userEvent.setup()

    const editing = makeRoom({
      id: 5,
      room_type: roomTypes[0],
      accommodation: roomTypes[0].accommodations[0],
    })

    renderForm({ room: editing, existingRooms: [editing] })

    await waitFor(() =>
      expect(screen.getByLabelText(/tipo de habitación/i)).toBeEnabled(),
    )

    await user.selectOptions(screen.getByLabelText(/tipo de habitación/i), '1')

    await waitFor(() => {
      const options = within(
        screen.getByLabelText(/acomodación/i),
      ).getAllByRole('option')

      // Si se detectara a sí misma como duplicada, quedaría bloqueada
      // justamente la opción que el usuario quiere conservar.
      const sencilla = options.find((o) => o.textContent?.includes('Sencilla'))
      expect(sencilla).toBeEnabled()
    })
  })
})

describe('regla de capacidad', () => {
  it('informa cuántas habitaciones quedan disponibles', async () => {
    renderForm({ hotel: makeHotel({ max_rooms: 42, occupied_rooms: 37 }) })

    expect(
      await screen.findByText(/quedan 5 habitaciones disponibles de 42/i),
    ).toBeInTheDocument()
  })

  it('devuelve al saldo la cantidad de la configuración que se edita', async () => {
    // El hotel tiene 40 de 42 ocupadas, de las cuales 12 son la configuración
    // que se está editando. Al reemplazarse, esas 12 vuelven a estar
    // disponibles: 42 - 40 + 12 = 14.
    renderForm({
      hotel: makeHotel({ max_rooms: 42, occupied_rooms: 40 }),
      room: makeRoom({ quantity: 12 }),
    })

    expect(
      await screen.findByText(/quedan 14 habitaciones disponibles de 42/i),
    ).toBeInTheDocument()
  })

  it('impide asignar cuando el hotel está completo', async () => {
    renderForm({ hotel: makeHotel({ max_rooms: 42, occupied_rooms: 42 }) })

    expect(
      await screen.findByText(/sin capacidad disponible/i),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /asignar habitaciones/i }),
    ).toBeDisabled()
  })
})
