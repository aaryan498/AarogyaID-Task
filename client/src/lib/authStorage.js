export const AUTH_STORAGE_KEY = 'aarogyaid_auth'

export function readAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.token === 'string' && parsed.user) return parsed
    return null
  } catch {
    return null
  }
}

export function writeAuth(session) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Storage unavailable (private mode / quota); session lives in memory only.
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function getStoredToken() {
  return readAuth()?.token ?? null
}