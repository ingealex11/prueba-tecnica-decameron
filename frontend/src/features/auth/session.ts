import type { AuthUser } from '@/shared/api/types'

/**
 * Persistencia de la sesión en el navegador.
 *
 * El token y la persona autenticada se guardan en `localStorage` para que
 * recargar la página o abrir una pestaña nueva no obligue a iniciar sesión de
 * nuevo. Es un módulo sin React a propósito: lo consume tanto el contexto de
 * autenticación como el interceptor de Axios, y este último no puede usar
 * hooks.
 *
 * Toda lectura y escritura va envuelta en try/catch. `localStorage` puede no
 * estar disponible —navegación privada con restricciones, almacenamiento
 * lleno, política corporativa— y en ese caso la aplicación debe seguir
 * funcionando, simplemente sin recordar la sesión.
 */

const TOKEN_KEY = 'decameron.auth.token'
const USER_KEY = 'decameron.auth.user'

export interface StoredSession {
  token: string
  user: AuthUser
}

export const session = {
  read(): StoredSession | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const rawUser = localStorage.getItem(USER_KEY)

      if (!token || !rawUser) return null

      return { token, user: JSON.parse(rawUser) as AuthUser }
    } catch {
      return null
    }
  },

  write(next: StoredSession): void {
    try {
      localStorage.setItem(TOKEN_KEY, next.token)
      localStorage.setItem(USER_KEY, JSON.stringify(next.user))
    } catch {
      // Sin almacenamiento la sesión vive sólo en memoria; no es un error.
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // Ídem.
    }
  },

  /** Acceso rápido al token, para el interceptor de peticiones. */
  token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
}

/**
 * Notifica a la aplicación que la sesión dejó de ser válida.
 *
 * Lo emite el interceptor de Axios al recibir un 401 con token, y lo escucha
 * el contexto de autenticación para limpiar el estado y redirigir al inicio de
 * sesión. Un evento del DOM evita que el cliente HTTP dependa de React.
 */
export const SESSION_EXPIRED_EVENT = 'decameron:session-expired'

export function announceSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}
