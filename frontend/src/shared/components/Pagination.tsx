import type { Pagination as PaginationMeta } from '@/shared/api/types'

import { Button } from './Button'

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
}

/**
 * Controles de paginación.
 *
 * Se limita a anterior/siguiente con el rango visible en texto, en lugar de
 * numerar todas las páginas. Con un inventario hotelero el número de páginas es
 * pequeño y la navegación es casi siempre secuencial; una lista de números
 * añadiría ruido sin resolver ninguna necesidad real.
 */
export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { current_page, last_page, from, to, total } = pagination

  // Con una sola página los controles no aportan nada y sólo ocupan espacio.
  if (!last_page || last_page <= 1) {
    return null
  }

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row"
      aria-label="Paginación de resultados"
    >
      <p className="text-sm text-slate-600">
        Mostrando <span className="font-medium">{from ?? 0}</span>–
        <span className="font-medium">{to ?? 0}</span> de{' '}
        <span className="font-medium">{total ?? 0}</span> hoteles
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
        >
          Anterior
        </Button>

        <span className="px-2 text-sm text-slate-600" aria-current="page">
          {current_page} / {last_page}
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  )
}
