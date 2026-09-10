import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/shared/theme/themeContext'
import { cn } from '@/shared/utils/cn'

/**
 * Conmutador de tema claro/oscuro.
 *
 * `aria-pressed` comunica el estado a los lectores de pantalla; el icono por
 * sí solo no lo haría.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
      className={cn(
        'grid size-9 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}
