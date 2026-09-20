import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getRoleHome } from '../../utils/roles'

const sizes = {
  md: 'text-xl',
  sm: 'text-base',
}

const iconSizes = {
  md: 'h-5 w-5',
  sm: 'h-4 w-4',
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
      <img
        src="/favicon.ico"
        alt=""
        aria-hidden="true"
        className={clsx(
          'mr-1.5 shrink-0 self-center object-contain',
          iconSizes[size],
        )}
      />
      <span className="font-semibold text-slate-900">Aarogya</span>
      <span className="font-bold text-violet-600">ID</span>
    </Link>
  )
}