import { RefreshCw, SearchX, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './Button'

/**
 * Estados de carga, vacío y error de una vista.
 *
 * Tenerlos como componentes propios evita que cada pantalla los improvise —o
 * peor, los omita— y garantiza que la persona nunca se quede mirando una zona
 * en blanco sin saber si el sistema está trabajando, si no hay datos o si algo
 * falló.
 */

/** Esqueleto de carga con la forma aproximada del contenido que va a llegar. */
export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5" role="status" aria-live="polite" aria-label="Cargando información">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4" aria-hidden="true">
          <div className="skeleton size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-1/3" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="skeleton h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

/** Estado vacío, con una acción que permita salir de él. */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = SearchX,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-ink-3" aria-hidden="true">
        <Icon className="size-6" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-2">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/**
 * Estado de error con opción de reintentar.
 *
 * Ofrecer el reintento importa: la causa más habitual es un corte momentáneo
 * de red, y obligar a recargar la página entera por ello haría perder el
 * trabajo en curso.
 */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center" role="alert">
      <span className="grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger" aria-hidden="true">
        <TriangleAlert className="size-6" />
      </span>
      <h3 className="text-base font-semibold text-ink">No se pudo cargar la información</h3>
      <p className="max-w-md text-sm text-ink-2">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshCw />} className="mt-2">
          Reintentar
        </Button>
      )}
    </div>
  )
}
