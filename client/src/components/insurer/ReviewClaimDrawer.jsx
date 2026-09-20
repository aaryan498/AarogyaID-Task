import { useState } from 'react'
import clsx from 'clsx'
import { CircleCheck, CircleX } from 'lucide-react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Drawer from '../ui/Drawer'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import ClaimStatusBadge from '../claims/ClaimStatusBadge'
import DocumentLinks from '../claims/DocumentLinks'
import { useToast } from '../../hooks/useToast'
import { updateClaimStatus } from '../../lib/claimsApi'
import { getApprovedAmountText, hasDocuments } from '../../utils/claims'
import { formatCurrency, formatDate } from '../../utils/formatters'

const DECISIONS = [
  { value: 'Approved', label: 'Approve', icon: CircleCheck },
  { value: 'Rejected', label: 'Reject', icon: CircleX },
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'

/** Mirrors the backend rule: the approved amount can never exceed the claim amount. */
function getAmountError(value, claimAmount) {
  if (value.trim() === '') return 'Approved amount is required.'
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return 'Enter an amount of 0 or more.'
  if (amount > claimAmount) {
    return `Can’t exceed the claim amount of ${formatCurrency(claimAmount)}.`
  }
  return ''
}

function DetailItem({ label, className, children }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  )
}

function ReviewPanel({ claim, onClose, onUpdated }) {
  const toast = useToast()

  const isPending = claim.status === 'Pending'
  const insurerComments = claim.insurerComments?.trim()

  const [decision, setDecision] = useState(null)
  const [amount, setAmount] = useState(String(claim.claimAmount))
  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const amountError = decision === 'Approved' ? getAmountError(amount, claim.claimAmount) : ''
  const canSave = decision !== null && !amountError && !saving

  const handleClose = () => {
    if (!saving) onClose()
  }

  const handleSelectDecision = (value) => {
    setDecision(value)
    setSubmitError('')
  }

  const handleAmountChange = (event) => {
    setAmount(event.target.value)
    setSubmitError('')
  }

  const handleCommentsChange = (event) => {
    setComments(event.target.value)
    setSubmitError('')
  }

  const handleSave = async () => {
    if (!canSave) return

    const payload = { status: decision }
    if (decision === 'Approved') payload.approvedAmount = Number(amount)
    const trimmedComments = comments.trim()
    if (trimmedComments) payload.insurerComments = trimmedComments

    setSaving(true)
    setSubmitError('')
    try {
      const updated = await updateClaimStatus(claim._id, payload)
      onUpdated(updated)
    } catch (error) {
      // Shown inline (the user is still in context) and as a toast for consistency.
      setSubmitError(error.message)
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const footer = isPending ? (
    <div className="space-y-3">
      {submitError && <Alert onDismiss={() => setSubmitError('')}>{submitError}</Alert>}
      <Button onClick={handleSave} loading={saving} disabled={!canSave} className="w-full">
        Save Decision
      </Button>
    </div>
  ) : null

  return (
    <Drawer open onClose={handleClose} title="Review Claim" footer={footer}>
      <div className="space-y-6">
        <ClaimStatusBadge status={claim.status} />

        <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
          <DetailItem label="Patient Name" className="col-span-2">
            <span className="block break-words">{claim.name}</span>
          </DetailItem>
          <DetailItem label="Email" className="col-span-2">
            <span className="block break-all">{claim.email}</span>
          </DetailItem>
          <DetailItem label="Claim Amount">{formatCurrency(claim.claimAmount)}</DetailItem>
          <DetailItem label="Submission Date">{formatDate(claim.submissionDate)}</DetailItem>
          <DetailItem label="Description" className="col-span-2">
            <span className="block whitespace-pre-wrap break-words">{claim.description}</span>
          </DetailItem>
        </dl>

        <section>
          <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
          <div className="mt-2">
            {hasDocuments(claim) ? (
              <DocumentLinks urls={claim.documentUrl} />
            ) : (
              <p className="text-sm text-slate-600">No documents were uploaded for this claim.</p>
            )}
          </div>
        </section>

        {insurerComments && (
          <dl>
            <DetailItem label="Insurer Comments">
              <span className="block whitespace-pre-wrap break-words">{insurerComments}</span>
            </DetailItem>
          </dl>
        )}

        {isPending ? (
          <section className="space-y-4 border-t border-slate-200 pt-6">
            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-sm font-medium text-slate-700">Decision</legend>
              <div className="grid grid-cols-2 gap-2">
                {DECISIONS.map(({ value, label, icon: Icon }) => {
                  const selected = decision === value
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      disabled={saving}
                      onClick={() => handleSelectDecision(value)}
                      className={clsx(
                        'inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm transition-colors duration-150',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        focusRing,
                        selected
                          ? 'border-violet-600 bg-violet-50 font-semibold text-slate-900 ring-1 ring-violet-600'
                          : 'border-slate-300 font-medium text-slate-700 hover:bg-slate-50',
                      )}
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        className={selected ? 'text-violet-600' : 'text-slate-500'}
                      />
                      {label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {decision === 'Approved' && (
              <Input
                label="Approved amount (₹)"
                name="approvedAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                required
                disabled={saving}
                value={amount}
                onChange={handleAmountChange}
                error={amountError}
                hint={`Requested: ${formatCurrency(claim.claimAmount)}. You can approve up to this amount.`}
              />
            )}

            <Textarea
              label="Comments"
              name="insurerComments"
              disabled={saving}
              hint="Optional. The patient can see these comments."
              value={comments}
              onChange={handleCommentsChange}
            />
          </section>
        ) : (
          <section className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-900">Decision</h3>
            <dl className="mt-3">
              <DetailItem label="Approved Amount">{getApprovedAmountText(claim)}</DetailItem>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              This claim has already been decided and can’t be changed.
            </p>
          </section>
        )}
      </div>
    </Drawer>
  )
}

/**
 * `claim` is the full claim object, or null when closed. Keyed by claim id so the
 * form state always starts fresh for each claim that is opened.
 */
export default function ReviewClaimDrawer({ claim, onClose, onUpdated }) {
  if (!claim) return null
  return <ReviewPanel key={claim._id} claim={claim} onClose={onClose} onUpdated={onUpdated} />
}