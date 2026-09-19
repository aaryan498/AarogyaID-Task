import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/** Returns { success(message), error(message), info(message), dismiss(id) }. */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}