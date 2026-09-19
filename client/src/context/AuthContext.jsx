import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from '../hooks/useAuth'
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
  const [session, setSession] = useState(loadSession)

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