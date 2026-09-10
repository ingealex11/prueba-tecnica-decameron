import { createContext, useContext } from 'react'

/** Contexto de notificaciones, separado del proveedor por el recargado en caliente. */
export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface ToastInput {
  tone: ToastTone
  title: string
  description?: string
}

export interface ToastContextValue {
  notify: (toast: ToastInput) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>.')
  }

  return context
}
