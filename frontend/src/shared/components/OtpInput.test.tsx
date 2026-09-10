import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { OtpInput } from '@/shared/components/OtpInput'

/*
|-----------------------------------------------------------------------------
| Entrada del código de verificación
|-----------------------------------------------------------------------------
|
| Lo que hace cómodo este campo es el manejo del foco y del portapapeles. Un
| fallo aquí no rompe la seguridad —el servidor verifica igual— pero convierte
| el segundo factor en una molestia, y una molestia en el login es lo primero
| que la gente pide desactivar.
|
*/

function Harness({ onComplete }: { onComplete?: (v: string) => void }) {
  const [value, setValue] = useState('')
  return <OtpInput value={value} onChange={setValue} onComplete={onComplete} />
}

describe('OtpInput', () => {
  it('avanza el foco al escribir cada dígito', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const boxes = screen.getAllByRole('textbox')
    expect(boxes).toHaveLength(6)
    expect(boxes[0]).toHaveFocus()

    await user.keyboard('4')
    expect(boxes[0]).toHaveValue('4')
    expect(boxes[1]).toHaveFocus()
  })

  it('reparte un código pegado entre las casillas y lo completa', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<Harness onComplete={onComplete} />)

    await user.click(screen.getAllByRole('textbox')[0])
    await user.paste('482913')

    const boxes = screen.getAllByRole('textbox')
    expect(boxes.map((b) => (b as HTMLInputElement).value).join('')).toBe('482913')
    expect(onComplete).toHaveBeenCalledWith('482913')
  })

  it('ignora lo que no sea dígito', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getAllByRole('textbox')[0])
    await user.paste('12ab34')

    const boxes = screen.getAllByRole('textbox')
    expect(boxes.map((b) => (b as HTMLInputElement).value).join('')).toBe('1234')
  })

  it('retrocede el foco al borrar una casilla vacía', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const boxes = screen.getAllByRole('textbox')
    await user.keyboard('7')
    expect(boxes[1]).toHaveFocus()

    await user.keyboard('{Backspace}')
    expect(boxes[0]).toHaveFocus()
  })

  it('invoca onComplete sólo con seis dígitos', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<Harness onComplete={onComplete} />)

    await user.keyboard('12345')
    expect(onComplete).not.toHaveBeenCalled()

    await user.keyboard('6')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('123456')
  })
})
