import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

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

/**
 * Menú desplegable de acciones.
 *
 * Se abre con clic o con teclado, se cierra con Escape o al pulsar fuera, y
 * las flechas mueven el foco entre opciones. Es el patrón "menu button" de
 * las prácticas de accesibilidad ARIA, sin dependencias externas.
 */
export function Menu({ trigger, items, align = 'right', triggerLabel }: MenuProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const onPointer = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)

    // Al abrir, el foco pasa a la primera opción para que el teclado funcione
    // sin pasos intermedios.
    list.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus()

    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const moveFocus = (direction: 1 | -1) => {
    const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])]
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = buttons[(index + direction + buttons.length) % buttons.length]
    next?.focus()
  }

  return (
    <div ref={root} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={triggerLabel}
        onClick={() => setOpen((o) => !o)}
        className="grid size-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={list}
          id={menuId}
          role="menu"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1) }
            if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1) }
          }}
          className={cn(
            'absolute z-30 mt-1 min-w-44 overflow-hidden rounded-xl bg-surface p-1 shadow-pop ring-1 ring-line animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
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
                  item.tone === 'danger'
                    ? 'text-danger hover:bg-danger-soft'
                    : 'text-ink hover:bg-surface-2',
                )}
              >
                {item.icon && <span className="text-ink-3 [&>svg]:size-4" aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
