import clsx from 'clsx'

const tones = {
  neutral: 'bg-slate-100 text-slate-700',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  violet: 'bg-violet-50 text-violet-700',
}

export default function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      {...props}
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}