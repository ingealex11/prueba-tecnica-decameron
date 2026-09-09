import { cn } from '@/shared/utils/cn'

/**
 * Estilos compartidos por los controles de formulario.
 *
 * Vive fuera de `Field.tsx` porque exportar una función junto a componentes
 * impide que el recargado en caliente de React funcione en ese archivo: la
 * herramienta no puede distinguir qué exportación es un componente y opta por
 * recargar la página entera, perdiendo el estado del formulario en cada
 * cambio.
 *
 * @param hasError Si el control está en estado de error, para resaltarlo.
 */
export function controlClasses(hasError: boolean): string {
  return cn(
    'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 transition-colors',
    'placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
  )
}
