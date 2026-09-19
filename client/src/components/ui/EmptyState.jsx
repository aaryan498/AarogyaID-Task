import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, children }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <Icon size={32} strokeWidth={1.5} className="text-slate-400" />
      <h2 className="mt-3 text-base font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-600">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}