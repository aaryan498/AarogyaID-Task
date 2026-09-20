import { useCallback, useEffect, useState } from 'react'
import { getClaimById, getPatientClaims } from '../lib/claimsApi'

/**
 * Shared fetch lifecycle for the three read pages (list, step 2, detail).
 * `isLoading` is derived by checking whether the stored result belongs to the current
 * request, so no state is set synchronously inside the effect (react-hooks/set-state-in-effect).
 */
function useRequest(key, fetcher) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const requestKey = `${key}:${attempt}`

  useEffect(() => {
    let ignore = false
    fetcher().then(
      (data) => {
        if (!ignore) setResult({ requestKey, data, error: null })
      },
      (error) => {
        if (!ignore) setResult({ requestKey, data: null, error })
      },
    )
    return () => {
      ignore = true
    }
  }, [requestKey, fetcher])

  const retry = useCallback(() => setAttempt((count) => count + 1), [])
  const current = result?.requestKey === requestKey ? result : null

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    isLoading: current === null,
    retry,
  }
}

export function useClaims(email) {
  const fetcher = useCallback(() => getPatientClaims(email), [email])
  return useRequest(`claims:${email}`, fetcher)
}

export function useClaim(id) {
  const fetcher = useCallback(() => getClaimById(id), [id])
  return useRequest(`claim:${id}`, fetcher)
}