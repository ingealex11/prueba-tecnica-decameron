import { cn } from '@/shared/utils/cn'

/**
 * Estilos compartidos por los controles de formulario.
 *
 * Vive fuera de `Field.tsx` porque exportar una función junto a componentes
 * impide que el recargado en caliente de React funcione en ese archivo.
 *
 * @param hasError Si el control está en estado de error, para resaltarlo.
 */
export function controlClasses(hasError: boolean): string {
  return cn(
    'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink transition-all',
    'placeholder:text-ink-3 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3',
    'focus:outline-none focus:ring-4',
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-line-strong hover:border-ink-3 focus:border-accent focus:ring-accent/15',
  )
}
