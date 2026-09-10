import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CapacityMeter } from '@/shared/components/CapacityMeter'

/*
|-----------------------------------------------------------------------------
| Indicador de capacidad
|-----------------------------------------------------------------------------
|
| Muestra el dato con el que el gerente decide cuántas habitaciones puede
| añadir, de modo que una cifra equivocada aquí lleva a errores de trabajo.
|
| Las pruebas cubren, además de los casos corrientes, dos frontera: el hotel
| completo y el estado imposible en que lo ocupado supera al máximo, donde una
| resta sin proteger produciría un número negativo sin sentido y una barra
| desbordada.
|
*/

/**
 * La cifra "ocupadas / máximo" se compone de dos elementos —el número en
 * negrita y el máximo atenuado—, así que se comprueba sobre el texto completo
 * del medidor en lugar de buscar una cadena en un único nodo.
 */
function meterText(): string {
  return screen.getByRole('meter').parentElement?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

describe('CapacityMeter', () => {
  it('muestra lo ocupado sobre el máximo y las habitaciones libres', () => {
    render(<CapacityMeter occupied={37} max={42} />)

    expect(meterText()).toContain('37 / 42')
    expect(screen.getByText('5 libres')).toBeInTheDocument()
  })

  it('indica "Completo" cuando no queda capacidad', () => {
    render(<CapacityMeter occupied={42} max={42} />)

    expect(screen.getByText('Completo')).toBeInTheDocument()
    expect(screen.queryByText(/libres/)).not.toBeInTheDocument()
  })

  it('reproduce el ejemplo del enunciado: 42 de 42 habitaciones', () => {
    // 25 Estándar-Sencilla + 12 Junior-Triple + 5 Estándar-Doble = 42
    render(<CapacityMeter occupied={25 + 12 + 5} max={42} />)

    expect(meterText()).toContain('42 / 42')
    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  it('expone la proporción a las tecnologías de asistencia', () => {
    render(<CapacityMeter occupied={30} max={80} />)

    // Sin estos atributos la barra sería puramente decorativa y quien use un
    // lector de pantalla no percibiría la información que transmite.
    const meter = screen.getByRole('meter')

    expect(meter).toHaveAttribute('aria-valuenow', '30')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '80')
    expect(meter).toHaveAccessibleName('30 de 80 habitaciones configuradas')
  })

  it('nunca muestra un número negativo de habitaciones libres', () => {
    // Estado que las reglas de negocio impiden, pero ante el cual la interfaz
    // debe degradar con sensatez en lugar de mostrar "-8 libres".
    render(<CapacityMeter occupied={50} max={42} />)

    expect(screen.getByText('Completo')).toBeInTheDocument()
    expect(screen.queryByText(/-\d+ libres/)).not.toBeInTheDocument()
  })

  it('tolera un máximo de cero sin dividir por cero', () => {
    render(<CapacityMeter occupied={0} max={0} />)

    expect(meterText()).toContain('0 / 0')
    expect(screen.getByText('Completo')).toBeInTheDocument()
  })
})
