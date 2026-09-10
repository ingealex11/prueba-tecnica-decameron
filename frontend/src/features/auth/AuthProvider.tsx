import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { AuthContext, useAuth, type AuthContextValue } from '@/features/auth/authContext'
import { SESSION_EXPIRED_EVENT, session } from '@/features/auth/session'
import { authService } from '@/shared/api/services'
import type { AuthUser } from '@/shared/api/types'

/**
 * Estado de autenticación de la aplicación.
 *
 * Expone quién está autenticado y las tres operaciones del flujo: iniciar
 * sesión (paso 1), verificar el código (paso 2) y cerrar sesión. Los
 * componentes no hablan con el servicio directamente: pasan por aquí, que es
 * el único sitio que sabe cómo se persiste y se invalida la sesión.
 */

/** Nombre con el que queda registrado el token, visible en el servidor. */
function deviceName(): string {
  const ua = navigator.userAgent
  const browser = /Firefox/.test(ua) ? 'Firefox' : /Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : 'Navegador'
  const os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : ''

  return [browser, os].filter(Boolean).join(' · ')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => session.read()?.user ?? null)
  const [isRestoring, setIsRestoring] = useState<boolean>(() => session.read() !== null)

  /*
   * Al arrancar con una sesión guardada, se confirma con el servidor que el
   * token sigue siendo válido. Sin esta comprobación, un token revocado desde
   * otro dispositivo seguiría mostrando la aplicación hasta la primera
   * petición que fallara, y ésa podría ser justo un guardado.
   */
  useEffect(() => {
    const stored = session.read()
    if (!stored) return

    let cancelled = false

    authService
      .me()
      .then((fresh) => {
        if (cancelled) return
        session.write({ token: stored.token, user: fresh })
        setUser(fresh)
      })
      .catch(() => {
        if (cancelled) return
        session.clear()
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // El interceptor avisa cuando el servidor rechaza el token; aquí se limpia
  // el estado para que la interfaz reaccione sin que cada pantalla tenga que
  // comprobarlo.
  useEffect(() => {
    const handleExpired = () => {
      session.clear()
      setUser(null)
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
  }, [])

  const login = useCallback(
    (email: string, password: string) => authService.login(email, password, deviceName()),
    [],
  )

  const verify = useCallback(async (challengeId: string, code: string) => {
    const opened = await authService.verify(challengeId, code, deviceName())

    session.write({ token: opened.token, user: opened.user })
    setUser(opened.user)

    return opened.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      // Se limpia localmente aunque el servidor falle: si no hay red, la
      // persona igual debe poder salir de la aplicación en su equipo.
      session.clear()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isRestoring, login, verify, logout }),
    [user, isRestoring, login, verify, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Protege una zona de la aplicación.
 *
 * Mientras se restaura la sesión no se decide nada: redirigir al inicio de
 * sesión en ese instante haría que quien tiene sesión válida viera parpadear
 * la pantalla de login en cada recarga.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isRestoring } = useAuth()
  const location = useLocation()

  if (isRestoring) {
    return null
  }

  if (!isAuthenticated) {
    // Se recuerda a dónde quería ir, para llevarle allí tras autenticarse.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
