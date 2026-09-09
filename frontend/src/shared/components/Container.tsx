import type { ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

/**
 * Contenedor centrado con los márgenes laterales de la aplicación.
 *
 * El ancho máximo es holgado a propósito: el enunciado señala que los gerentes
 * trabajan en portátiles de 13 y 15 pulgadas, y una tabla de cinco columnas
 * necesita ese espacio para leerse sin apreturas. En monitores grandes el
 * límite evita líneas de texto tan largas que cuesten seguir.
 *
 * Existe como componente en lugar de vivir en el armazón porque no todas las
 * secciones se limitan: la cabecera de la página de presentación ocupa el ancho
 * completo, y sólo su contenido interior se centra.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6', className)}>
      {children}
    </div>
  )
}
