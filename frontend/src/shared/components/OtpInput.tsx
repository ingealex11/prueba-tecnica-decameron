import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

import { cn } from '@/shared/utils/cn'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  /** Se invoca al completar todos los dígitos, para enviar sin pulsar nada. */
  onComplete?: (value: string) => void
  disabled?: boolean
  hasError?: boolean
  autoFocus?: boolean
}

/**
 * Entrada de código de verificación, una casilla por dígito.
 *
 * Resuelve lo que hace cómodo este tipo de campo y que un input normal no da:
 * el foco avanza solo al escribir, retrocede al borrar, y pegar el código
 * completo desde el portapapeles lo reparte entre las casillas. Al completar
 * el último dígito se envía automáticamente, porque a nadie le gusta escribir
 * seis números y tener que buscar el botón.
 *
 * Es un único valor lógico repartido en varias casillas visuales; por eso el
 * estado vive fuera, como una cadena, y aquí sólo se maneja el foco.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus()
  }, [autoFocus])

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)

    if (clean.length === length) {
      onComplete?.(clean)
    }
  }

  const focusAt = (index: number) => {
    inputs.current[Math.max(0, Math.min(length - 1, index))]?.focus()
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = digits.slice()
    next[index] = digit

    commit(next.join(''))

    if (digit) focusAt(index + 1)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        const next = digits.slice()
        next[index] = ''
        commit(next.join(''))
      } else {
        focusAt(index - 1)
      }
      event.preventDefault()
    } else if (event.key === 'ArrowLeft') {
      focusAt(index - 1)
      event.preventDefault()
    } else if (event.key === 'ArrowRight') {
      focusAt(index + 1)
      event.preventDefault()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text')
    event.preventDefault()
    commit(pasted)
    focusAt(pasted.replace(/\D/g, '').length)
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="Código de verificación">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'size-12 rounded-xl border-2 bg-surface text-center font-mono text-2xl font-semibold text-ink transition-all sm:size-14',
            'focus:outline-none focus:ring-4',
            hasError
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : digit
                ? 'border-accent focus:ring-accent/20'
                : 'border-line-strong focus:border-accent focus:ring-accent/20',
            disabled && 'opacity-50',
          )}
        />
      ))}
    </div>
  )
}
