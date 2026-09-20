import { formatCurrency } from './formatters'

/** Claim status -> Badge tone. Status text is always rendered too, so colour is never the only signal. */
export const STATUS_TONES = {
  Pending: 'amber',
  Approved: 'emerald',
  Rejected: 'red',
}

/**
 * A real approved figure is only ever shown for Approved claims. The backend stores
 * approvedAmount = 0 for Pending/Rejected, which must never be displayed as "₹0".
 */
export function getApprovedAmountText(claim) {
  if (claim.status === 'Approved') return formatCurrency(claim.approvedAmount)
  if (claim.status === 'Pending') return 'Awaiting review'
  if (claim.status === 'Rejected') return 'Not approved'
  return '—'
}

export function hasDocuments(claim) {
  return Array.isArray(claim.documentUrl) && claim.documentUrl.length > 0
}