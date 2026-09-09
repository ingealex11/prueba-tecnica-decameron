import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

/**
 * Utilidades compartidas por las pruebas del frontend.
 */

/**
 * Crea un cliente de consultas aislado para una prueba.
 *
 * Cada prueba recibe el suyo: compartir uno haría que la caché de una filtrara
 * datos a la siguiente, produciendo fallos que dependen del orden de ejecución
 * y son de los más difíciles de diagnosticar.
 *
 * Se desactivan los reintentos porque en una prueba un fallo debe manifestarse
 * de inmediato, no tras varios intentos que sólo alargan la ejecución.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })
}

/**
 * Renderiza un componente con los proveedores que la aplicación le da en
 * producción.
 *
 * Sin ellos, cualquier componente que use un hook de datos o un enlace de
 * navegación fallaría al montarse, y habría que envolverlo a mano en cada
 * prueba.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions & { queryClient?: QueryClient } = {},
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}
