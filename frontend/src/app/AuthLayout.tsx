import { ShieldCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/shared/components/ThemeToggle'

/**
 * Armazón de las pantallas de autenticación: panel de marca a la izquierda y
 * formulario a la derecha. En pantallas estrechas sólo se muestra el
 * formulario, que es lo que importa.
 */
export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-sidebar text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Fondo: malla de gradientes suaves, sin imágenes externas. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-32 -top-32 size-[28rem] rounded-full bg-brand-600/40 blur-3xl" />
          <div className="absolute -bottom-40 right-0 size-[30rem] rounded-full bg-teal-500/20 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-base font-bold ring-1 ring-white/20 backdrop-blur">
            D
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Decameron</span>
            <span className="block text-[0.7rem] uppercase tracking-wider text-white/60">Gestión hotelera</span>
          </span>
        </Link>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Cada hotel, cada habitación, <span className="text-brand-300">sin configuraciones inválidas.</span>
          </h1>
          <p className="text-white/70">
            El sistema hace cumplir las reglas del negocio por diseño: la acomodación siempre corresponde al tipo, nunca
            se repite una combinación, y la capacidad del hotel jamás se supera.
          </p>

          <ul className="space-y-3 text-sm text-white/80">
            {[
              'Autenticación en dos pasos con código de verificación',
              'Ubicación de cada sede en el mapa',
              'API REST documentada y verificada con 113 pruebas',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Prueba técnica · Alex Niño</p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link to="/" className="flex items-center gap-2 lg:invisible">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-xs font-bold text-accent-ink">D</span>
            <span className="text-sm font-semibold text-ink">Decameron</span>
          </Link>
          <ThemeToggle />
        </div>

        <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-md animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
