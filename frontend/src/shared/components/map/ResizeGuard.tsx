import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Recalcula el tamaño del mapa cuando su contenedor cambia.
 *
 * Leaflet mide su contenedor una sola vez, al montarse. Si en ese momento el
 * contenedor está oculto, animándose o aún sin su tamaño final —como ocurre
 * dentro de un diálogo que se está abriendo—, el mapa queda dibujando sólo una
 * esquina. Observar el contenedor y pedir a Leaflet que vuelva a medirse
 * corrige el problema sin depender de temporizadores a ciegas.
 */
export function ResizeGuard() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()

    // Primera medición tras el montaje, cuando el diálogo ya terminó de abrir.
    const initial = window.setTimeout(() => map.invalidateSize({ animate: false }), 60)

    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }))
    observer.observe(container)
    if (container.parentElement) observer.observe(container.parentElement)

    return () => {
      window.clearTimeout(initial)
      observer.disconnect()
    }
  }, [map])

  return null
}
