import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Configuración común de la suite de pruebas del frontend.
 *
 * Se ejecuta antes de cada archivo de pruebas.
 */

/*
 * Desmonta lo renderizado al terminar cada prueba.
 *
 * Sin esto, los componentes se acumularían en el DOM entre pruebas y consultas
 * como `getByRole('button')` fallarían por encontrar coincidencias de pruebas
 * anteriores, produciendo fallos que dependen del orden de ejecución.
 */
afterEach(() => {
  cleanup()
})
