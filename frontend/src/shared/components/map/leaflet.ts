import L from 'leaflet'

/**
 * Iconos de marcador.
 *
 * Leaflet localiza sus imágenes por defecto con rutas relativas al CSS, algo
 * que Vite rompe al empaquetar: los marcadores aparecen como recuadros rotos.
 * En lugar de servir las imágenes, se define un marcador propio en SVG, que
 * además adopta el color de la marca y se ve nítido en cualquier densidad de
 * pantalla.
 */
function pinSvg(color: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
      <path d="M15 0C6.7 0 0 6.6 0 14.8 0 25.9 15 40 15 40s15-14.1 15-25.2C30 6.6 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="14.5" r="5.5" fill="white" fill-opacity="0.95"/>
    </svg>`
}

export const brandMarker = L.divIcon({
  className: 'decameron-marker',
  html: pinSvg('#1c53f5'),
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -36],
})

export const brandMarkerActive = L.divIcon({
  className: 'decameron-marker',
  html: pinSvg('#14b8a6'),
  iconSize: [34, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
})

/** Centro aproximado de Colombia, para cuando no hay puntos que encuadrar. */
export const COLOMBIA_CENTER: [number, number] = [4.6, -74.1]

/**
 * Capa base de OpenStreetMap.
 *
 * Sin clave ni cuota: funciona igual en local y en el despliegue, de modo que
 * el mapa nunca aparece roto por una credencial caducada.
 */
export const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
