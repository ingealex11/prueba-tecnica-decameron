import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { ThemeContext, type Theme } from './themeContext'

/**
 * Tema claro u oscuro.
 *
 * La preferencia del sistema decide el valor inicial; a partir de ahí manda
 * lo que la persona elija, que se recuerda entre visitas. El tema se aplica
 * como clase en `<html>` y el resto lo resuelven las variables de CSS del
 * sistema de diseño: ningún componente sabe en qué tema está.
 */
const STORAGE_KEY = 'decameron.theme'

function initialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Sin almacenamiento se usa la preferencia del sistema.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    // Informa al navegador para que los controles nativos adopten el tema.
    root.style.colorScheme = theme

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Se aplica igual; sólo no se recordará.
    }
  }, [theme])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])
  const toggle = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
