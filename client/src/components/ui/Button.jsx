import clsx from 'clsx'
import Spinner from './Spinner'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60'

const variants = {
  primary: 'bg-violet-600 text-white hover:bg-violet-700',
  secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

/**
 * `as` lets the button styling be applied to a router <Link> (or any element)
 * without nesting a link inside a <button>.
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type,
  className,
  children,
  ...props
}) {
  const isDisabled = disabled || loading
  const elementProps =
    Component === 'button'
      ? { type: type ?? 'button', disabled: isDisabled }
      : { 'aria-disabled': isDisabled || undefined }

  return (
    <Component
      {...props}
      {...elementProps}
      aria-busy={loading || undefined}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {loading && <Spinner size={16} />}
      {children}
    </Component>
  )
}