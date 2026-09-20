import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react'
import Logo from './Logo'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

const GUEST_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
const PATIENT_NAV = [
  { to: '/patient', label: 'My Claims', end: true },
  { to: '/patient/claims/new', label: 'Submit Claim' },
]
const INSURER_NAV = [{ to: '/insurer', label: 'Claims Dashboard' }]

function getNavItems(user) {
  if (!user) return GUEST_NAV
  if (user.role === 'PATIENT') return PATIENT_NAV
  if (user.role === 'INSURER') return INSURER_NAV
  return []
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'

export default function Topbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(() => window.scrollY > 0)
  // Menus are "open for a given path", so they close automatically on navigation.
  const [mobileOpenPath, setMobileOpenPath] = useState(null)
  const [userMenuPath, setUserMenuPath] = useState(null)
  const userMenuRef = useRef(null)

  const mobileOpen = mobileOpenPath === location.pathname
  const userMenuOpen = userMenuPath === location.pathname

  const navItems = getNavItems(user)
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!userMenuOpen && !mobileOpen) return undefined

    const onPointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuPath(null)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setUserMenuPath(null)
        setMobileOpenPath(null)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [userMenuOpen, mobileOpen])

  const handleLogout = () => {
    setUserMenuPath(null)
    setMobileOpenPath(null)
    logout()
    navigate('/login', { replace: true })
  }

  const desktopLinkClass = ({ isActive }) =>
    clsx(
      'inline-flex h-full items-center border-b-2 px-1 text-sm transition-colors duration-150',
      focusRing,
      isActive
        ? 'border-violet-600 font-medium text-slate-900'
        : 'border-transparent text-slate-600 hover:text-slate-900',
    )

  const mobileLinkClass = ({ isActive }) =>
    clsx(
      'block rounded-md px-3 py-2 text-sm transition-colors duration-150',
      focusRing,
      isActive
        ? 'bg-violet-50 font-medium text-slate-900'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    )

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 border-b border-slate-200 bg-white transition-shadow duration-200',
        scrolled && 'shadow-sm',
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-slate-900 focus:ring-2 focus:ring-violet-600"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden h-full items-stretch gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuPath(userMenuOpen ? null : location.pathname)}
                aria-expanded={userMenuOpen}
                aria-controls="user-menu"
                className={clsx(
                  'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100',
                  focusRing,
                )}
              >
                <User size={20} strokeWidth={1.5} />
                <span className="max-w-32 truncate">{firstName}</span>
                <ChevronDown size={16} strokeWidth={1.5} />
              </button>
              {userMenuOpen && (
                <div
                  id="user-menu"
                  className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={clsx(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100',
                      focusRing,
                    )}
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button as={Link} to="/register" size="sm">
                Sign Up
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpenPath(mobileOpen ? null : location.pathname)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className={clsx(
            'inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition-colors duration-150 hover:bg-slate-100 md:hidden',
            focusRing,
          )}
        >
          {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6"
          >
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mx-auto max-w-6xl border-t border-slate-200 px-4 py-3 sm:px-6">
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700">
                  <User size={20} strokeWidth={1.5} />
                  <span className="truncate">{firstName}</span>
                </p>
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                  <LogOut size={20} strokeWidth={1.5} />
                  Log out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button as={Link} to="/login" variant="ghost">
                  Login
                </Button>
                <Button as={Link} to="/register">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}