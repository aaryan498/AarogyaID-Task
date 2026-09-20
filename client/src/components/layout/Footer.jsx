import { Link } from 'react-router-dom'
import Logo from './Logo'

const CURRENT_YEAR = new Date().getFullYear()

const linkClass =
  'rounded-md text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-1">
          <Logo size="sm" />
          <p className="text-xs text-slate-500">© {CURRENT_YEAR} AarogyaID</p>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <Link to="/about" className={linkClass}>
            About
          </Link>
          <Link to="/contact" className={linkClass}>
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}