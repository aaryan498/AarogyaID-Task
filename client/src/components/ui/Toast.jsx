import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { ToastContext } from '../../hooks/useToast'

const DISMISS_AFTER_MS = 4000

const TYPES = {
  success: { icon: CircleCheck, iconClass: 'text-emerald-600', border: 'border-emerald-200' },
  error: { icon: CircleAlert, iconClass: 'text-red-600', border: 'border-red-200' },
  info: { icon: Info, iconClass: 'text-violet-600', border: 'border-slate-200' },
}

export function Toast({ type = 'info', message, onDismiss }) {
  const { icon: Icon, iconClass, border } = TYPES[type]

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={clsx(
        'pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-3 shadow-sm',
        border,
      )}
    >
      <Icon size={20} strokeWidth={1.5} className={clsx('mt-0.5 shrink-0', iconClass)} />
      <p className="min-w-0 flex-1 break-words text-sm text-slate-700">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-0.5 text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (type, message) => {
      nextId.current += 1
      const id = nextId.current
      setToasts((current) => [...current, { id, type, message }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DISMISS_AFTER_MS),
      )
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}