import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { queryClient } from '@/app/queryClient'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ToastProvider } from '@/shared/components/Toast'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'

/**
 * Raíz de la aplicación.
 *
 * Monta los proveedores globales y delega todo lo demás en el enrutador. El
 * orden importa: el tema va fuera de todo para que hasta el indicador de carga
 * inicial respete el modo oscuro, y la autenticación va dentro del cliente de
 * consultas porque restaurar la sesión es una consulta más.
 */
export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
