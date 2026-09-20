import { apiRequest } from './apiClient'

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== ''

export function createClaim({ name, email, claimAmount, description }) {
  return apiRequest('/claims', {
    method: 'POST',
    body: { name, email, claimAmount, description },
  })
}

/** `fileList` may be a FileList or an array of File objects. */
export function uploadClaimDocuments(claimId, fileList) {
  const formData = new FormData()
  Array.from(fileList).forEach((file) => formData.append('files', file))

  return apiRequest(`/claims/${encodeURIComponent(claimId)}/upload-documents`, {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export function getPatientClaims(email) {
  return apiRequest(`/claims/patient?email=${encodeURIComponent(email)}`)
}

export function getClaimById(id) {
  return apiRequest(`/claims/${encodeURIComponent(id)}`)
}

/**
 * Insurer: all claims, filtered server-side. Only filters that are set are sent.
 * `toDate` arrives as a bare YYYY-MM-DD from <input type="date">; the backend compares
 * it with <=, so it is extended to the end of that day to make the range inclusive.
 */
export function getAllClaims({ status, fromDate, toDate, minAmount, maxAmount } = {}) {
  const params = new URLSearchParams()

  if (hasValue(status)) params.set('status', status)
  if (hasValue(fromDate)) params.set('fromDate', fromDate)
  if (hasValue(toDate)) params.set('toDate', `${toDate}T23:59:59.999`)
  if (hasValue(minAmount)) params.set('minAmount', String(minAmount).trim())
  if (hasValue(maxAmount)) params.set('maxAmount', String(maxAmount).trim())

  const query = params.toString()
  return apiRequest(query ? `/claims?${query}` : '/claims')
}

/** Insurer: `payload` is { status, approvedAmount?, insurerComments? }. */
export function updateClaimStatus(id, payload) {
  return apiRequest(`/claims/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: payload,
  })
}