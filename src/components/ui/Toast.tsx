import { useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import {
  ToastContext,
  type ToastType,
  type ToastMessage,
  type ToastContextValue,
} from '@/hooks/useToast'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      setToasts((prev) => [...prev, { id, type, title, description, duration }])

      if (duration > 0) {
        window.setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast],
  )

  const contextValue: ToastContextValue = {
    toast: {
      success: (title, desc) => addToast('success', title, desc),
      error: (title, desc) => addToast('error', title, desc, 6000),
      info: (title, desc) => addToast('info', title, desc),
    },
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Viewport Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-2.5"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              role={item.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-surface-200/90 bg-surface-100/95 p-3.5 shadow-2xl backdrop-blur-md"
            >
              <div className="mt-0.5 shrink-0">
                {item.type === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                )}
                {item.type === 'error' && (
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                )}
                {item.type === 'info' && (
                  <Info className="h-4 w-4 text-accent-400" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-mono text-xs font-semibold text-surface-900">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-surface-500">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                aria-label="Fechar notificação"
                className="shrink-0 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
