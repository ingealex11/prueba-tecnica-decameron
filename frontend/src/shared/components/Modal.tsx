import { useEffect, useRef, type ReactNode } from 'react'

import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Ancho máximo del diálogo. */
  size?: 'md' | 'lg'
}

/**
 * Diálogo modal.
 *
 * Se apoya en el elemento nativo `<dialog>` en lugar de recrearlo con divs,
 * porque el navegador ya resuelve correctamente lo que suele hacerse mal:
 * atrapar el foco dentro del diálogo, devolverlo al cerrar, cerrar con Escape
 * y situarlo por encima de todo sin pelearse con los z-index.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // `showModal` es lo que activa el comportamiento modal real; `show` a secas
    // deja el resto de la página accesible con el tabulador.
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // El navegador cierra el diálogo con Escape por su cuenta. Hay que
    // escuchar ese evento para que el estado de React no quede creyendo que
    // sigue abierto.
    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className={`m-auto w-[calc(100vw-2rem)] rounded-xl p-0 backdrop:bg-slate-900/50 ${
        size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
      }`}
      // Cerrar al pulsar fuera: el clic sobre el propio <dialog> (no sobre su
      // contenido) corresponde al área del fondo.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 shrink-0"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </Button>
        </header>

        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </dialog>
  )
}
