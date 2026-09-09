import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './styles/index.css'

/**
 * Punto de entrada de la aplicación.
 *
 * `StrictMode` sólo actúa en desarrollo: monta cada componente dos veces para
 * sacar a la luz efectos secundarios mal contenidos. Es incómodo al depurar,
 * pero detecta antes de producción errores que de otro modo aparecerían de
 * forma intermitente.
 */
const container = document.getElementById('root')

if (!container) {
  throw new Error('No se encontró el elemento raíz #root en el documento.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
