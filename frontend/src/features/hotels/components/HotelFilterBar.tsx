import { useEffect, useState } from 'react'

import { useCities } from '@/features/catalogs/hooks/useCatalogs'
import type { HotelFilters } from '@/shared/api/types'
import { controlClasses } from '@/shared/utils/formControls'

interface HotelFilterBarProps {
  filters: HotelFilters
  onChange: (filters: HotelFilters) => void
}

/** Milisegundos de espera antes de buscar tras dejar de escribir. */
const SEARCH_DEBOUNCE_MS = 350

/**
 * Barra de búsqueda y filtros del listado.
 *
 * El campo de texto se aplaza deliberadamente: sin ese retardo, escribir
 * "Cartagena" lanzaría nueve peticiones, ocho de ellas desechadas antes de
 * mostrarse. El desplegable de ciudad, en cambio, se aplica al instante, porque
 * elegir una opción es una acción deliberada y completa.
 */
export function HotelFilterBar({ filters, onChange }: HotelFilterBarProps) {
  const { data: cities = [] } = useCities()

  // El input mantiene su propio estado para responder a cada pulsación; lo que
  // se aplaza es la consulta, no la escritura.
  const [searchTerm, setSearchTerm] = useState(filters.search ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      // Evita relanzar la consulta cuando el valor no cambió realmente, cosa
      // que ocurre al montar el componente.
      if ((filters.search ?? '') === searchTerm) return

      onChange({ ...filters, search: searchTerm || undefined, page: 1 })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchTerm, filters, onChange])

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <label htmlFor="hotel-search" className="sr-only">
          Buscar hotel por nombre o NIT
        </label>
        <input
          id="hotel-search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por nombre o NIT…"
          className={controlClasses(false)}
        />
      </div>

      <div className="sm:w-56">
        <label htmlFor="hotel-city" className="sr-only">
          Filtrar por ciudad
        </label>
        <select
          id="hotel-city"
          value={filters.city_id ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              city_id: event.target.value ? Number(event.target.value) : undefined,
              // Volver a la primera página al cambiar el filtro: mantenerse en
              // la página 4 de un resultado que ahora tiene una sola página
              // mostraría una tabla vacía sin explicación.
              page: 1,
            })
          }
          className={controlClasses(false)}
        >
          <option value="">Todas las ciudades</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
