import { apiRequest } from './apiClient'

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