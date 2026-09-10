import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/shared/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Ancho máximo del diálogo. */
  size?: 'md' | 'lg' | 'xl'
}

/**
 * Diálogo modal.
 *
 * Se apoya en el elemento nativo `<dialog>` en lugar de recrearlo con divs,
 * porque el navegador ya resuelve correctamente lo que suele hacerse mal:
 * atrapar el foco dentro del diálogo, devolverlo al cerrar, cerrar con Escape
 * y situarlo por encima de todo sin pelearse con los z-index.
 */
export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    else if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // El navegador cierra el diálogo con Escape por su cuenta; hay que
    // escuchar ese evento para que el estado de React no crea que sigue abierto.
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
      className={cn(
        'm-auto w-[calc(100vw-2rem)] rounded-2xl bg-surface p-0 text-ink shadow-pop ring-1 ring-line',
        'backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:animate-fade-up',
        size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
      )}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="flex max-h-[88vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-[18px]" />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </dialog>
  )
}
