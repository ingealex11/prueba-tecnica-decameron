import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/utils/cn'

interface MenuItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
}

interface MenuProps {
  trigger: ReactNode
  items: Array<MenuItem | 'separator'>
  align?: 'left' | 'right'
  triggerLabel: string
}

/** Separación entre el botón y el menú, y margen mínimo respecto al borde de la ventana. */
const GAP = 4
const VIEWPORT_MARGIN = 8

/**
 * Menú desplegable de acciones.
 *
 * Se abre con clic o con teclado, se cierra con Escape o al pulsar fuera, y
 * las flechas mueven el foco entre opciones. Es el patrón "menu button" de
 * las prácticas de accesibilidad ARIA, sin dependencias externas.
 *
 * El panel se renderiza en un portal sobre `document.body` con posición fija,
 * calculada a partir del botón. Si se posicionara de forma absoluta dentro de
 * su contenedor, cualquier antecesor con `overflow: hidden` —las tarjetas de
 * la aplicación lo usan para recortar sus esquinas— lo recortaría, y en las
 * últimas filas de una tabla quedaría medio oculto. Si no cabe por debajo del
 * botón, se abre hacia arriba.
 */
export function Menu({ trigger, items, align = 'right', triggerLabel }: MenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const menuId = useId()

  /**
   * Sitúa el panel respecto al botón, dentro de la ventana visible.
   *
   * Se recalcula al abrir y cada vez que la página se desplaza o cambia de
   * tamaño, para que el panel siga pegado a su botón en lugar de quedarse
   * flotando donde estaba.
   */
  const place = () => {
    if (!button.current || !list.current) return

    const anchor = button.current.getBoundingClientRect()
    const panel = list.current.getBoundingClientRect()

    const fitsBelow = anchor.bottom + GAP + panel.height <= window.innerHeight - VIEWPORT_MARGIN
    const top = fitsBelow ? anchor.bottom + GAP : anchor.top - GAP - panel.height

    const preferredLeft = align === 'right' ? anchor.right - panel.width : anchor.left
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, preferredLeft),
      window.innerWidth - panel.width - VIEWPORT_MARGIN,
    )

    setPosition({ top, left })
  }

  // Primera colocación, una vez el panel está montado y es medible.
  useLayoutEffect(() => {
    if (open) place()
    else setPosition(null)
    // `place` lee refs y `align`; recrearla en cada render sería ruido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, align])

  useEffect(() => {
    if (!open) return

    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (!button.current?.contains(target) && !list.current?.contains(target)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)

    list.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus()

    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const moveFocus = (direction: 1 | -1) => {
    const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])]
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    buttons[(index + direction + buttons.length) % buttons.length]?.focus()
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={triggerLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'grid size-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink',
          open && 'bg-surface-2 text-ink',
        )}
      >
        {trigger}
      </button>

      {open &&
        createPortal(
          <div
            ref={list}
            id={menuId}
            role="menu"
            aria-label={triggerLabel}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1) }
              if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1) }
            }}
            style={{ position: 'fixed', top: position?.top ?? -9999, left: position?.left ?? -9999 }}
            className={cn(
              'z-50 min-w-52 overflow-hidden rounded-xl bg-surface p-1 shadow-pop ring-1 ring-line',
              position && 'animate-fade-in',
            )}
          >
            {items.map((item, i) =>
              item === 'separator' ? (
                <div key={`sep-${i}`} role="separator" className="my-1 h-px bg-line" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false)
                    item.onSelect()
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    'focus:outline-none focus-visible:bg-surface-2 disabled:opacity-40',
                    item.tone === 'danger' ? 'text-danger hover:bg-danger-soft' : 'text-ink hover:bg-surface-2',
                  )}
                >
                  {item.icon && <span className="text-ink-3 [&>svg]:size-4" aria-hidden="true">{item.icon}</span>}
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
