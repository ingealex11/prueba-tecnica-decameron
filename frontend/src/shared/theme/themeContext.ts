import { createContext, useContext } from 'react'

/**
 * Contexto del tema, separado del proveedor.
 *
 * Un archivo que exporta un componente y además un hook rompe el recargado en
 * caliente de React: la herramienta no puede saber qué exportación es un
 * componente y recarga la página entera. Por eso el contexto y el hook viven
 * aquí y el proveedor, que es un componente, en su propio archivo.
 */
export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.')
  }

  return context
}
