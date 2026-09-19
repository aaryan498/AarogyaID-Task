import { useId } from 'react'
import clsx from 'clsx'
import Field from './Field'

export default function Input({
  id,
  name,
  label,
  error,
  hint,
  type = 'text',
  className,
  ...props
}) {
  const autoId = useId()
  const fieldId = id ?? name ?? autoId
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={props.required}>
      <input
        {...props}
        id={fieldId}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={clsx(
          'block h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400',
          'transition-colors duration-150 focus:outline-none focus:ring-2',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          error
            ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
            : 'border-slate-300 focus:border-violet-600 focus:ring-violet-600',
          className,
        )}
      />
    </Field>
  )
}