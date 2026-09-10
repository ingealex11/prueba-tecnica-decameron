import { BookOpenText, Building2, LayoutDashboard, LogOut, Map, Menu as MenuIcon, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/authContext'
import { Avatar } from '@/shared/components/Avatar'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { cn } from '@/shared/utils/cn'

/**
 * Armazón del panel de administración: barra lateral oscura fija y área de
 * contenido.
 *
 * En pantallas estrechas la barra se convierte en un panel deslizable que se
 * abre desde la cabecera, de modo que el contenido conserve todo el ancho.
 */
const NAV = [
  { to: '/app', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/app/hoteles', label: 'Hoteles', icon: Building2 },
  { to: '/app/mapa', label: 'Mapa de sedes', icon: Map },
]

const API_DOCS_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '/docs/api')

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-ink">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-line px-5">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
          D
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-white">Decameron</p>
          <p className="truncate text-[0.7rem] uppercase tracking-wider text-sidebar-ink-2">Gestión hotelera</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegación principal">
        <p className="eyebrow px-3 pb-2 text-sidebar-ink-2">Operación</p>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-sidebar-ink hover:bg-white/5 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('size-[18px] shrink-0', isActive ? 'text-brand-300' : 'text-sidebar-ink-2 group-hover:text-sidebar-ink')} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        <p className="eyebrow px-3 pb-2 pt-5 text-sidebar-ink-2">Desarrollo</p>
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-ink transition-colors hover:bg-white/5 hover:text-white"
        >
          <BookOpenText className="size-[18px] shrink-0 text-sidebar-ink-2 group-hover:text-sidebar-ink" />
          Documentación de la API
          <span className="ml-auto text-[0.65rem] text-sidebar-ink-2">↗</span>
        </a>
      </nav>

      {user && (
        <div className="border-t border-sidebar-line p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={user.name} initials={user.initials} size="md" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-sidebar-ink-2">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-sidebar-ink-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Barra lateral fija en escritorio. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Panel deslizable en móvil. */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in"
          />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-pop animate-fade-in">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 lg:hidden"
          >
            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>

          <div id="page-header-slot" className="min-w-0 flex-1" />

          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
