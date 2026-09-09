import type { ReactNode } from 'react'

import { Button } from './Button'

/**
 * Estados de carga, vacío y error de una vista.
 *
 * Tenerlos como componentes propios evita que cada pantalla los improvise —o
 * peor, los omita— y garantiza que el usuario nunca se quede mirando una zona
 * en blanco sin saber si el sistema está trabajando, si no hay datos o si algo
 * falló.
 */

/** Esqueleto de carga con la forma aproximada del contenido que va a llegar. */
export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="space-y-3 p-6"
      // El lector de pantalla anuncia que se está cargando; sin esto, la espera
      // es completamente silenciosa.
      role="status"
      aria-live="polite"
      aria-label="Cargando información"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-lg bg-slate-200"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

/** Estado vacío, con una acción que permita salir de él. */
export function EmptyState({
  title,
  description,
  action,
  icon = '🏨',
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/**
 * Estado de error con opción de reintentar.
 *
 * Ofrecer el reintento importa: la causa más habitual es un corte momentáneo de
 * red, y obligar a recargar la página entera por ello haría perder el trabajo
 * en curso.
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center" role="alert">
      <span className="text-4xl" aria-hidden="true">
        ⚠️
      </span>
      <h3 className="text-base font-semibold text-slate-900">
        No se pudo cargar la información
      </h3>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Reintentar
        </Button>
      )}
    </div>
  )
}
