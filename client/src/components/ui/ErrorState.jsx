import { TriangleAlert } from 'lucide-react'
import Button from './Button'

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-12 text-center">
      <TriangleAlert size={32} strokeWidth={1.5} className="text-red-600" />
      <p className="mt-3 max-w-sm text-sm text-slate-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  )
}