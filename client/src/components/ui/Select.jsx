import { useId } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import Field from './Field'

export default function Select({ id, name, label, error, hint, className, children, ...props }) {
  const autoId = useId()
  const fieldId = id ?? name ?? autoId
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={props.required}>
      <div className="relative">
        <select
          {...props}
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={clsx(
            'block h-10 w-full appearance-none rounded-lg border bg-white pl-3 pr-9 text-sm text-slate-900',
            'transition-colors duration-150 focus:outline-none focus:ring-2',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            error
              ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-violet-600 focus:ring-violet-600',
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </Field>
  )
}