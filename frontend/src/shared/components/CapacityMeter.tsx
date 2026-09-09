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
 * modo que merece estar siempre visible y no escondido tras un cálculo mental.
 * El color anticipa el límite antes de alcanzarlo: quien está al 95 % debería
 * notarlo antes de que el servidor rechace su siguiente asignación.
 *
 * El color nunca es el único portador de información: la cifra exacta se
 * muestra siempre en texto, para quien no distingue los matices.
 */
export function CapacityMeter({ occupied, max, compact = false }: CapacityMeterProps) {
  // Se acota al 100 % por prudencia: si por cualquier motivo el ocupado
  // superara el máximo, una barra desbordada rompería la maquetación.
  const percentage = max > 0 ? Math.min(100, Math.round((occupied / max) * 100)) : 0
  const available = Math.max(0, max - occupied)

  const tone =
    percentage >= 100
      ? { bar: 'bg-red-500', text: 'text-red-700' }
      : percentage >= 85
        ? { bar: 'bg-amber-500', text: 'text-amber-700' }
        : { bar: 'bg-emerald-500', text: 'text-emerald-700' }

  return (
    <div className={cn('flex flex-col gap-1', compact ? 'w-32' : 'w-full')}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-slate-700">
          {occupied} / {max}
        </span>
        <span className={cn('font-medium', tone.text)}>
          {available === 0 ? 'Completo' : `${available} libres`}
        </span>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-slate-200"
        // Los atributos ARIA de medidor permiten que un lector de pantalla
        // anuncie la proporción; sin ellos la barra es puramente decorativa.
        role="meter"
        aria-valuenow={occupied}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${occupied} de ${max} habitaciones configuradas`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', tone.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
