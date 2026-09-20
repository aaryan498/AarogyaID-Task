import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { setUnauthorizedHandler } from '../lib/apiClient'
import * as authApi from '../lib/authApi'
import { clearAuth, readAuth, writeAuth } from '../lib/authStorage'
import { getTokenExpiry } from '../utils/jwt'

// Hydration is synchronous (localStorage), so the session is read once via a
// lazy state initializer. There is never a render where a stored session is
// "not yet known", which avoids a flash of logged-out UI on refresh.
function loadSession() {
  const stored = readAuth()
  if (!stored) return null

  const expiry = getTokenExpiry(stored.token)
  if (expiry === null || expiry * 1000 <= Date.now()) {
    clearAuth()
    return null
  }
  return stored
}

export function AuthProvider({ children }) {
  const toast = useToast()
  const [session, setSession] = useState(loadSession)
  // Mirrors `session` so several in-flight requests failing with 401 at once
  // trigger a single logout and a single toast.
  const sessionRef = useRef(session)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const persist = useCallback((data) => {
    const next = { token: data.access_token, user: data.user }
    writeAuth(next)
    setSession(next)
    return next.user
  }, [])

  const login = useCallback(
    async (email, password) => persist(await authApi.login({ email, password })),
    [persist],
  )

  const register = useCallback(
    async (payload) => persist(await authApi.register(payload)),
    [persist],
  )

  const logout = useCallback(() => {
    clearAuth()
    setSession(null)
  }, [])

  // Token expired (or was rejected) while the tab was open: clear the session.
  // RequireAuth then redirects to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!sessionRef.current) return
      sessionRef.current = null
      logout()
      toast.info('Your session has expired. Please log in again.')
    })
    return () => setUnauthorizedHandler(null)
  }, [logout, toast])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      isLoading: false, // hydration is synchronous; kept so guards honour the contract
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}