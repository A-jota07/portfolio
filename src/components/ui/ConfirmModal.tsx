import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Foca o botão cancelar por segurança ao abrir o modal
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onCancel()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bento-card relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-surface-200/90 bg-surface-100 p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  variant === 'danger'
                    ? 'border border-rose-500/20 bg-rose-500/10 text-rose-400'
                    : 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3
                  id="confirm-modal-title"
                  className="font-display text-base font-bold text-surface-900"
                >
                  {title}
                </h3>
                <p
                  id="confirm-modal-desc"
                  className="mt-2 text-sm leading-relaxed text-surface-500"
                >
                  {message}
                </p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                aria-label="Fechar diálogo"
                className="shrink-0 rounded-lg p-1.5 text-surface-400 hover:bg-surface-200 hover:text-surface-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-200/60 pt-4">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-xl border border-surface-200 bg-surface-100 px-4 py-2 font-mono text-xs font-medium text-surface-700 transition hover:bg-surface-200 focus:ring-2 focus:ring-accent-400 focus:outline-none"
              >
                {cancelText}
              </button>

              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Excluindo...' : confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
