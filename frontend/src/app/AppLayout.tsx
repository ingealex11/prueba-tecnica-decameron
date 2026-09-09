import { NavLink, Outlet } from 'react-router-dom'

import { cn } from '@/shared/utils/cn'

/**
 * Estructura común de las pantallas de la aplicación.
 *
 * El contenido se limita en anchura porque en un monitor amplio las líneas
 * demasiado largas cansan la lectura, pero el límite es holgado para que una
 * tabla de cinco columnas siga siendo cómoda en un portátil de 13 pulgadas.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-700 text-sm font-bold text-white"
              aria-hidden="true"
            >
              D
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-slate-900">
                Decameron
              </span>
              <span className="block text-xs leading-tight text-slate-500">
                Gestión Hotelera
              </span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1" aria-label="Navegación principal">
            <NavItem to="/" end>
              Inicio
            </NavItem>
            <NavItem to="/app">Hoteles</NavItem>
          </nav>
        </div>
      </header>

      {/*
        El armazón no limita el ancho del contenido: lo hace cada página con
        `Container`. Así la cabecera de la presentación puede ocupar todo el
        ancho de la ventana mientras el resto de secciones se mantiene centrado.
      */}
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
          Prueba técnica · Hoteles Decameron de Colombia
        </div>
      </footer>
    </div>
  )
}

/**
 * Enlace de navegación que refleja la ruta activa.
 *
 * `aria-current` lo comunica también a los lectores de pantalla: sin él, la
 * pestaña activa se distinguiría sólo por el color.
 */
function NavItem({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-100',
        )
      }
    >
      {children}
    </NavLink>
  )
}
