import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getRoleHome } from '../../utils/roles'

const sizes = {
  md: 'text-xl',
  sm: 'text-base',
}

export default function Logo({ size = 'md', className }) {
  const { user } = useAuth()

  return (
    <Link
      to={getRoleHome(user?.role)}
      className={clsx(
        'inline-flex items-baseline rounded-md tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2',
        sizes[size],
        className,
      )}
    >
      <span className="font-semibold text-slate-900">Aarogya</span>
      <span className="font-bold text-violet-600">ID</span>
    </Link>
  )
}