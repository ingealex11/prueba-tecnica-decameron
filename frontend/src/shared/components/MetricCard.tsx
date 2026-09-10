import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

interface MetricCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: LucideIcon
  tone?: 'brand' | 'success' | 'warning' | 'danger'
  /** Muestra un esqueleto mientras el valor no está disponible. */
  isLoading?: boolean
}

const TONES = {
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
}

/**
 * Tarjeta de indicador para el panel.
 *
 * Jerarquía deliberada: la cifra es lo primero que se lee, la etiqueta la
 * explica y la nota añade contexto. El icono no comunica información por sí
 * solo, así que se marca como decorativo para los lectores de pantalla.
 */
export function MetricCard({ label, value, hint, icon: Icon, tone = 'brand', isLoading }: MetricCardProps) {
  return (
    <div className="card flex items-start gap-4 p-5 animate-fade-up">
      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', TONES[tone])} aria-hidden="true">
        <Icon className="size-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="eyebrow">{label}</p>
        {isLoading ? (
          <div className="skeleton mt-2 h-8 w-20" />
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight text-ink tabular-nums">{value}</p>
        )}
        {hint && !isLoading && <p className="mt-1 text-sm text-ink-2">{hint}</p>}
      </div>
    </div>
  )
}
