import { createContext, useContext } from 'react'

import type { AuthUser, TwoFactorChallenge } from '@/shared/api/types'

/**
 * Contexto de autenticación, separado del proveedor por el recargado en
 * caliente: un archivo con componente y hook a la vez lo desactiva.
 */
export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** `true` mientras se comprueba si hay una sesión guardada válida. */
  isRestoring: boolean
  login: (email: string, password: string) => Promise<TwoFactorChallenge>
  verify: (challengeId: string, code: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  }

  return context
}
