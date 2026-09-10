import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

import { ToastContext, type ToastContextValue, type ToastInput, type ToastTone as Tone } from './toastContext'

/**
 * Notificaciones breves.
 *
 * Confirman que una acción tuvo efecto —"Hotel registrado"— sin interrumpir:
 * aparecen en una esquina y desaparecen solas. Los errores que exigen
 * atención van en el formulario, no aquí, porque una notificación que se
 * esfuma no es sitio para algo que la persona debe leer.
 */
interface Toast extends ToastInput {
  id: number
}

const ICONS: Record<Tone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
}

const TONES: Record<Tone, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-info',
  warning: 'text-warning',
}

const DURATION_MS = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random()
    setToasts((all) => [...all, { ...toast, id }])
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (title, description) => notify({ tone: 'success', title, description }),
      error: (title, description) => notify({ tone: 'error', title, description }),
    }),
    [notify],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* `aria-live` hace que los lectores de pantalla anuncien cada
          notificación al aparecer, sin robar el foco. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = ICONS[toast.tone]

  useEffect(() => {
    const timer = setTimeout(onDismiss, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-surface p-4 shadow-pop ring-1 ring-line animate-fade-up"
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', TONES[toast.tone])} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-ink-2">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="-m-1 rounded-md p-1 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
