import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 16, className }) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      size={size}
      strokeWidth={1.5}
      className={clsx('animate-spin', className)}
    />
  )
}