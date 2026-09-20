import { getStoredToken } from './authStorage'

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'
const MALFORMED_RESPONSE_MESSAGE =
  'Unexpected response from the server. Please check your connection or try again later.'

let unauthorizedHandler = null

/**
 * Lets the auth layer react to an expired/invalid session without this module
 * importing React. Registered by AuthProvider.
 */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

async function parseBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    // A successful response that is not JSON (for example an HTML page served because
    // the API base URL is wrong) must not silently resolve to null.
    if (response.ok) {
      const error = new Error(MALFORMED_RESPONSE_MESSAGE)
      error.status = response.status
      throw error
    }
    return null
  }
}

function getErrorMessage(data) {
  const message = data?.message
  if (Array.isArray(message) && message.length > 0) return message.join('; ')
  if (typeof message === 'string' && message) return message
  return FALLBACK_MESSAGE
}

export async function apiRequest(
  path,
  { method = 'GET', body, headers = {}, isFormData = false } = {},
) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
  const token = getStoredToken()

  const requestHeaders = { Accept: 'application/json', ...headers }
  if (token) requestHeaders.Authorization = `Bearer ${token}`

  const init = { method, headers: requestHeaders }

  if (body !== undefined) {
    if (isFormData) {
      // Let the browser set the multipart boundary.
      init.body = body
    } else {
      requestHeaders['Content-Type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
  }

  let response
  try {
    response = await fetch(`${baseUrl}${path}`, init)
  } catch {
    const networkError = new Error(
      'Unable to reach the server. Check your connection and try again.',
    )
    networkError.status = 0
    throw networkError
  }

  const data = await parseBody(response)

  if (!response.ok) {
    // A 401 on a request that carried a token means the session expired or was revoked.
    // Auth endpoints are excluded so a wrong password is still shown as a normal error.
    if (response.status === 401 && token && !path.startsWith('/auth/')) {
      unauthorizedHandler?.()
    }
    const error = new Error(getErrorMessage(data))
    error.status = response.status
    throw error
  }

  return data
}