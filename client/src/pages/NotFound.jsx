import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { getRoleHome } from '../utils/roles'

export default function NotFound() {
  const { user } = useAuth()

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:py-24">
      <title>Page not found | AarogyaID</title>
      <meta name="robots" content="noindex" />

      <p className="text-sm font-medium text-violet-600">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm text-slate-600">
        The page you are looking for doesn’t exist or has moved.
      </p>
      <Button as={Link} to={getRoleHome(user?.role)} className="mt-6">
        {user ? 'Back to dashboard' : 'Back to home'}
      </Button>
    </section>
  )
}