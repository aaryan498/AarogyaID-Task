import clsx from 'clsx'

const paddings = {
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