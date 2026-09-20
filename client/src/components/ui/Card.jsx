import clsx from 'clsx'

const paddings = {
  // `none` lets a child (e.g. a full-bleed table) own its spacing. A `p-0` className
  // override can't be relied on because Tailwind utility order isn't guaranteed.
  none: '',
  sm: 'p-4',
  md: 'p-6',
}

export default function Card({ padding = 'sm', className, children, ...props }) {
  return (
    <div
      {...props}
      className={clsx('rounded-lg border border-slate-200 bg-white', paddings[padding], className)}
    >
      {children}
    </div>
  )
}