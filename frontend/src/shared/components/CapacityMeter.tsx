import { cn } from '@/shared/utils/cn'

interface CapacityMeterProps {
  occupied: number
  max: number
  /** Versión compacta para las filas de una tabla. */
  compact?: boolean
}

/**
 * Indicador de capacidad de un hotel: cuántas habitaciones lleva configuradas
 * sobre su máximo.
 *
 * Es el dato con el que el gerente decide cuántas habitaciones puede añadir, de
 * modo que merece estar siempre visible. El color anticipa el límite antes de
 * alcanzarlo, pero nunca es el único portador de información: la cifra exacta
 * se muestra siempre en texto.
 */
export function CapacityMeter({ occupied, max, compact = false }: CapacityMeterProps) {
  // Se acota al 100 % por prudencia: si por cualquier motivo el ocupado
  // superara el máximo, una barra desbordada rompería la maquetación.
  const percentage = max > 0 ? Math.min(100, Math.round((occupied / max) * 100)) : 0
  const available = Math.max(0, max - occupied)

  const tone =
    percentage >= 100
      ? { bar: 'bg-danger', text: 'text-danger' }
      : percentage >= 85
        ? { bar: 'bg-warning', text: 'text-warning' }
        : { bar: 'bg-success', text: 'text-success' }

  return (
    <div className={cn('flex flex-col gap-1.5', compact ? 'w-36' : 'w-full')}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold tabular-nums text-ink">
          {occupied} <span className="font-normal text-ink-3">/ {max}</span>
        </span>
        <span className={cn('font-medium tabular-nums', tone.text)}>
          {available === 0 ? 'Completo' : `${available} libres`}
        </span>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-line"
        role="meter"
        aria-valuenow={occupied}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${occupied} de ${max} habitaciones configuradas`}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tone.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
