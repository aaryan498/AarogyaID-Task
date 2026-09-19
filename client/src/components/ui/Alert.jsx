import clsx from 'clsx'
import { CircleAlert, X } from 'lucide-react'

export default function Alert({ onDismiss, className, children }) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700',
        className,
      )}
    >
      <CircleAlert size={20} strokeWidth={1.5} className="mt-0.5 shrink-0" />
      <p className="min-w-0 flex-1 break-words">{children}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="rounded-md p-0.5 text-red-700 transition-colors duration-150 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}