import { Link } from 'react-router-dom'

import type { Hotel } from '@/shared/api/types'
import { Button } from '@/shared/components/Button'
import { CapacityMeter } from '@/shared/components/CapacityMeter'

interface HotelTableProps {
  hotels: Hotel[]
  onEdit: (hotel: Hotel) => void
  onDelete: (hotel: Hotel) => void
}

/**
 * Listado de hoteles.
 *
 * Se presenta de dos formas según el ancho disponible, y no como una tabla que
 * se desplaza en horizontal:
 *
 *   - Desde 1024 px —el caso de los portátiles de 13 y 15 pulgadas que menciona
 *     el enunciado— una tabla, que es lo que mejor permite comparar filas.
 *   - Por debajo, tarjetas apiladas. Una tabla de seis columnas en un móvil
 *     obliga a desplazarse lateralmente para leer cada fila, que es de las
 *     peores experiencias posibles.
 *
 * Ambas presentaciones muestran los mismos datos y ofrecen las mismas acciones:
 * la versión estrecha no es una versión recortada.
 */
export function HotelTable({ hotels, onEdit, onDelete }: HotelTableProps) {
  return (
    <>
      {/* ---- Tabla, desde 1024 px ---- */}
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Hoteles registrados, con su ubicación, NIT y capacidad configurada
          </caption>
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Hotel</th>
              <th scope="col" className="px-4 py-3 font-semibold">Ciudad</th>
              <th scope="col" className="px-4 py-3 font-semibold">NIT</th>
              <th scope="col" className="px-4 py-3 font-semibold">Capacidad</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hotels.map((hotel) => (
              <tr key={hotel.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{hotel.name}</p>
                  <p className="text-xs text-slate-500">{hotel.address}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {hotel.city?.name ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {hotel.nit}
                </td>
                <td className="px-4 py-3">
                  <CapacityMeter
                    occupied={hotel.occupied_rooms}
                    max={hotel.max_rooms}
                    compact
                  />
                </td>
                <td className="px-4 py-3">
                  <HotelActions
                    hotel={hotel}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Tarjetas, por debajo de 1024 px ---- */}
      <ul className="divide-y divide-slate-100 lg:hidden">
        {hotels.map((hotel) => (
          <li key={hotel.id} className="space-y-3 p-4">
            <div>
              <p className="font-medium text-slate-900">{hotel.name}</p>
              <p className="text-sm text-slate-500">{hotel.address}</p>
              <p className="mt-1 text-xs text-slate-500">
                {hotel.city?.name ?? '—'} · NIT {hotel.nit}
              </p>
            </div>

            <CapacityMeter
              occupied={hotel.occupied_rooms}
              max={hotel.max_rooms}
            />

            <HotelActions hotel={hotel} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  )
}

/**
 * Acciones disponibles sobre un hotel.
 *
 * Se extraen a un componente propio para que las dos presentaciones —tabla y
 * tarjeta— compartan exactamente el mismo comportamiento en lugar de mantener
 * dos copias que podrían divergir.
 */
function HotelActions({
  hotel,
  onEdit,
  onDelete,
}: {
  hotel: Hotel
  onEdit: (hotel: Hotel) => void
  onDelete: (hotel: Hotel) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        to={`/app/hoteles/${hotel.id}`}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
      >
        Habitaciones
      </Link>

      <Button variant="ghost" size="sm" onClick={() => onEdit(hotel)}>
        Editar
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(hotel)}
        className="text-red-600 hover:bg-red-50"
        // El nombre en la etiqueta accesible distingue cada botón: sin ella,
        // un lector de pantalla anunciaría una lista de "Eliminar" idénticos.
        aria-label={`Eliminar ${hotel.name}`}
      >
        Eliminar
      </Button>
    </div>
  )
}
