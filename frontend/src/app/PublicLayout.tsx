import { ArrowRight } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { useAuth } from '@/features/auth/authContext'
import { GithubIcon } from '@/shared/components/GithubIcon'
import { ThemeToggle } from '@/shared/components/ThemeToggle'

const REPO_URL = 'https://github.com/ingealex11/prueba-tecnica-decameron'

/**
 * Armazón de las páginas públicas: cabecera ligera sobre el contenido.
 */
export function PublicLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
              D
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-ink">Decameron</span>
              <span className="block text-[0.7rem] uppercase tracking-wider text-ink-3">Gestión hotelera</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Secciones">
            {[
              ['#reto', 'El reto'],
              ['#arquitectura', 'Arquitectura'],
              ['#reglas', 'Reglas'],
              ['#seguridad', 'Seguridad'],
              ['#calidad', 'Calidad'],
              ['#instalacion', 'Instalación'],
              ['#entregables', 'Entregables'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Repositorio en GitHub"
              className="grid size-9 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <GithubIcon className="size-[18px]" />
            </a>
            <ThemeToggle />
            <Link
              to={isAuthenticated ? '/app' : '/login'}
              className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-sm font-medium text-accent-ink shadow-sm transition-all hover:brightness-110"
            >
              {isAuthenticated ? 'Ir al panel' : 'Iniciar sesión'}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-ink-3 sm:flex-row sm:px-6">
          <p>Prueba técnica · Hoteles Decameron de Colombia · Dirección de Desarrollo</p>
          <p>
            Diseñado y construido por <span className="font-medium text-ink-2">Alex Niño</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
