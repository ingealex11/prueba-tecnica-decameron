import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

type Tone = 'error' | 'warning' | 'info' | 'success'

interface AlertProps {
  tone?: Tone
  title?: string
  children: ReactNode
  className?: string
}

const TONES: Record<Tone, { box: string; icon: typeof Info; iconColor: string }> = {
  error: { box: 'bg-danger-soft text-danger ring-danger/20', icon: XCircle, iconColor: 'text-danger' },
  warning: { box: 'bg-warning-soft text-warning ring-warning/20', icon: TriangleAlert, iconColor: 'text-warning' },
  info: { box: 'bg-info-soft text-info ring-info/20', icon: Info, iconColor: 'text-info' },
  success: { box: 'bg-success-soft text-success ring-success/20', icon: CheckCircle2, iconColor: 'text-success' },
}

/**
 * Mensaje destacado para errores y avisos.
 *
 * Los errores llevan `role="alert"` para que los lectores de pantalla los
 * anuncien al aparecer; los avisos informativos no, porque interrumpir la
 * lectura por algo que no requiere acción resulta molesto.
 */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const { box, icon: Icon, iconColor } = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl p-4 text-sm ring-1 ring-inset', box, className)}
    >
      <Icon className={cn('mt-0.5 size-4.5 shrink-0', iconColor)} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-ink">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div className="text-ink-2">{children}</div>
      </div>
    </div>
  )
}
