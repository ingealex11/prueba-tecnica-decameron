import { Alert } from './Alert'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  /** Consecuencia adicional que conviene advertir antes de confirmar. */
  warning?: string
  confirmLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmación de una acción destructiva.
 *
 * Existe porque eliminar debe requerir una decisión consciente. El botón de
 * confirmar es el único en rojo y no recibe el foco inicial, de modo que pulsar
 * Enter por inercia no destruya nada.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  warning,
  confirmLabel = 'Eliminar',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-ink-2">{message}</p>

        {warning && (
          <Alert tone="warning" title="Tenga en cuenta">
            {warning}
          </Alert>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
