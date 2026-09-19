/**
 * Returns the `exp` claim (seconds since epoch) of a JWT, or null if the
 * token cannot be decoded.
 */
export function getTokenExpiry(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const { exp } = JSON.parse(atob(padded))
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}