import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Pagination as PaginationMeta } from '@/shared/api/types'

import { Button } from './Button'

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
}

/**
 * Controles de paginación.
 *
 * Se limita a anterior/siguiente con el rango visible en texto. Con un
 * inventario hotelero el número de páginas es pequeño y la navegación es casi
 * siempre secuencial; una lista de números añadiría ruido sin resolver ninguna
 * necesidad real.
 */
export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { current_page, last_page, from, to, total } = pagination

  if (!last_page || last_page <= 1) return null

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 sm:flex-row"
      aria-label="Paginación de resultados"
    >
      <p className="text-sm text-ink-2">
        <span className="font-medium text-ink">{from ?? 0}–{to ?? 0}</span> de{' '}
        <span className="font-medium text-ink">{total ?? 0}</span> hoteles
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          icon={<ChevronLeft />}
          aria-label="Página anterior"
        >
          Anterior
        </Button>

        <span className="px-3 text-sm tabular-nums text-ink-2" aria-current="page">
          {current_page} / {last_page}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
          iconRight={<ChevronRight />}
          aria-label="Página siguiente"
        >
          Siguiente
        </Button>
      </div>
    </nav>
  )
}
