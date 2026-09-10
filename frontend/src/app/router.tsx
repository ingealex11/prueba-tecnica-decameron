import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AdminLayout } from '@/app/AdminLayout'
import { AuthLayout } from '@/app/AuthLayout'
import { PublicLayout } from '@/app/PublicLayout'
import { RequireAuth } from '@/features/auth/AuthProvider'
import { LoadingState } from '@/shared/components/States'

/**
 * Rutas de la aplicación.
 *
 * Tres zonas con armazón propio:
 *
 *   - Pública (`/`): presentación del proyecto.
 *   - Autenticación (`/login`): credenciales y código de verificación.
 *   - Panel (`/app/*`): la herramienta de trabajo, sólo con sesión.
 *
 * Cada pantalla se carga bajo demanda. Sin esta división, el paquete inicial
 * incluiría la presentación —extensa y visitada una vez— junto con el panel
 * entero y las librerías de mapas.
 */
const LandingPage = lazyPage(() => import('@/features/landing/pages/LandingPage'), 'LandingPage')
const LoginPage = lazyPage(() => import('@/features/auth/pages/LoginPage'), 'LoginPage')
const TwoFactorPage = lazyPage(() => import('@/features/auth/pages/TwoFactorPage'), 'TwoFactorPage')
const DashboardPage = lazyPage(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage')
const HotelsPage = lazyPage(() => import('@/features/hotels/pages/HotelsPage'), 'HotelsPage')
const HotelRoomsPage = lazyPage(() => import('@/features/rooms/pages/HotelRoomsPage'), 'HotelRoomsPage')
const MapPage = lazyPage(() => import('@/features/map/pages/MapPage'), 'MapPage')

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: '/', element: withSuspense(<LandingPage />) }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/login/verificar', element: withSuspense(<TwoFactorPage />) },
    ],
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'hoteles', element: withSuspense(<HotelsPage />) },
      { path: 'hoteles/:id', element: withSuspense(<HotelRoomsPage />) },
      { path: 'mapa', element: withSuspense(<MapPage />) },
    ],
  },
  // Cualquier ruta desconocida vuelve al inicio en lugar de dejar la pantalla
  // en blanco.
  { path: '*', element: <Navigate to="/" replace /> },
])

/**
 * Carga diferida de un componente exportado por nombre.
 *
 * `React.lazy` espera un módulo con exportación por defecto. Como aquí se
 * exportan por nombre, este ayudante hace la traducción en un solo lugar.
 */
function lazyPage<T extends string>(loader: () => Promise<Record<T, ComponentType>>, exportName: T) {
  return lazy(async () => ({ default: (await loader())[exportName] }))
}

function withSuspense(element: ReactNode) {
  return (
    <Suspense fallback={<div className="card"><LoadingState rows={4} /></div>}>
      {element}
    </Suspense>
  )
}
