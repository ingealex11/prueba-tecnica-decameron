import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@/app/AppLayout'
import { LoadingState } from '@/shared/components/States'

/**
 * Rutas de la aplicación.
 *
 * Dos zonas con propósitos distintos comparten el mismo armazón:
 *
 *   - `/` presenta el proyecto a quien lo evalúa.
 *   - `/app` es la herramienta de trabajo del gerente.
 *
 * Cada pantalla se carga bajo demanda. Sin esta división, el paquete inicial
 * incluiría la página de presentación —extensa y visitada una sola vez— junto
 * con la aplicación entera, de modo que el gerente que entra a diario a
 * gestionar hoteles descargaría cada vez un contenido que no va a mirar.
 */
const LandingPage = lazyPage(
  () => import('@/features/landing/pages/LandingPage'),
  'LandingPage',
)

const HotelsPage = lazyPage(
  () => import('@/features/hotels/pages/HotelsPage'),
  'HotelsPage',
)

const HotelRoomsPage = lazyPage(
  () => import('@/features/rooms/pages/HotelRoomsPage'),
  'HotelRoomsPage',
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<LandingPage />) },
      { path: 'app', element: withSuspense(<HotelsPage />) },
      { path: 'app/hoteles/:id', element: withSuspense(<HotelRoomsPage />) },
      // Cualquier ruta desconocida vuelve al inicio en lugar de dejar la
      // pantalla en blanco, que es lo que ocurre sin este comodín.
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

/**
 * Carga diferida de un componente exportado por nombre.
 *
 * `React.lazy` espera un módulo con exportación por defecto. Como aquí se
 * exportan por nombre —lo que hace los imports explícitos y facilita
 * renombrar—, este ayudante hace la traducción en un solo lugar en lugar de
 * repetir la misma envoltura en cada ruta.
 */
function lazyPage<T extends string>(
  loader: () => Promise<Record<T, ComponentType>>,
  exportName: T,
) {
  return lazy(async () => ({ default: (await loader())[exportName] }))
}

/**
 * Envuelve una pantalla con su indicador de carga.
 *
 * Sin `Suspense`, React lanzaría un error al encontrar un componente diferido
 * sin frontera de carga. Con él, el usuario ve un esqueleto durante la fracción
 * de segundo que tarda en llegar el fragmento.
 */
function withSuspense(element: ReactNode) {
  return <Suspense fallback={<LoadingState rows={4} />}>{element}</Suspense>
}
