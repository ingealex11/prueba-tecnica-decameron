import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Muestra un indicador y bloquea el botón mientras dura una operación. */
  isLoading?: boolean
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
}

/**
 * Botón de la aplicación.
 *
 * Concentra el estilo y, sobre todo, el estado de carga: mientras una operación
 * está en curso el botón se deshabilita solo. Sin eso, un doble clic impaciente
 * enviaría el formulario dos veces y crearía dos hoteles idénticos, uno de los
 * cuales sería rechazado con un error que el usuario no entendería.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      // El tipo por defecto de un botón dentro de un formulario es "submit",
      // lo que provoca envíos accidentales desde botones decorativos.
      type="button"
      disabled={disabled ?? isLoading}
      // Comunica el estado de carga a los lectores de pantalla, que no ven el
      // indicador giratorio.
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner /> : icon}
      {children}
    </button>
  )
}

/** Indicador de carga en línea. */
function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
