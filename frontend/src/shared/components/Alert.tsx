import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

type Tone = 'error' | 'warning' | 'info' | 'success'

interface AlertProps {
  tone?: Tone
  title?: string
  children: ReactNode
  className?: string
}

const TONES: Record<Tone, { box: string; icon: string; symbol: string }> = {
  error: { box: 'bg-red-50 text-red-800 ring-red-200', icon: 'text-red-500', symbol: '⚠' },
  warning: { box: 'bg-amber-50 text-amber-900 ring-amber-200', icon: 'text-amber-500', symbol: '⚠' },
  info: { box: 'bg-brand-50 text-brand-900 ring-brand-200', icon: 'text-brand-500', symbol: 'ℹ' },
  success: { box: 'bg-emerald-50 text-emerald-900 ring-emerald-200', icon: 'text-emerald-500', symbol: '✓' },
}

/**
 * Mensaje destacado para errores y avisos.
 *
 * Los errores llevan `role="alert"` para que los lectores de pantalla los
 * anuncien al aparecer; los avisos informativos no, porque interrumpir la
 * lectura por algo que no requiere acción resulta molesto.
 */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const styles = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-lg p-4 text-sm ring-1 ring-inset',
        styles.box,
        className,
      )}
    >
      <span className={cn('select-none text-base leading-5', styles.icon)} aria-hidden="true">
        {styles.symbol}
      </span>
      <div className="flex-1">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
