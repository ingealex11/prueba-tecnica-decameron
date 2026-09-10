import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Muestra un indicador y bloquea el botón mientras dura una operación. */
  isLoading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-ink shadow-sm hover:brightness-110 active:brightness-95 focus-visible:outline-accent',
  secondary:
    'bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-surface-2 active:bg-line',
  outline:
    'bg-transparent text-ink ring-1 ring-inset ring-line-strong hover:bg-surface-2',
  danger:
    'bg-danger text-white shadow-sm hover:brightness-110 focus-visible:outline-danger',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[0.8125rem] gap-1.5 rounded-lg [&_svg]:size-3.5',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg [&_svg]:size-4',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl [&_svg]:size-[18px]',
}

/**
 * Botón de la aplicación.
 *
 * Concentra el estilo y, sobre todo, el estado de carga: mientras una
 * operación está en curso el botón se deshabilita solo. Sin eso, un doble clic
 * impaciente enviaría el formulario dos veces y crearía dos hoteles idénticos,
 * uno de los cuales sería rechazado con un error que la persona no entendería.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconRight,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      // El tipo por defecto de un botón dentro de un formulario es "submit",
      // lo que provoca envíos accidentales desde botones decorativos.
      type={type}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : icon}
      {children}
      {!isLoading && iconRight}
    </button>
  )
}
