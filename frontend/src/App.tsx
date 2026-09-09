import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { queryClient } from '@/app/queryClient'
import { router } from '@/app/router'

/**
 * Raíz de la aplicación.
 *
 * Monta los proveedores globales y delega todo lo demás en el enrutador.
 */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
