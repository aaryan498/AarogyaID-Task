import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import ClaimStatusBadge from '../../components/claims/ClaimStatusBadge'
import DocumentLinks from '../../components/claims/DocumentLinks'
import { useClaim } from '../../hooks/useClaims'
import { getApprovedAmountText, hasDocuments } from '../../utils/claims'
import { formatCurrency, formatDate } from '../../utils/formatters'

const linkClass =
  'inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600'

function DetailItem({ label, className, children }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  )
}

export default function ClaimDetail() {
  const { id } = useParams()
  const { data: claim, error, isLoading, retry } = useClaim(id)
  const insurerComments = claim?.insurerComments?.trim()

  return (
    <div className="mx-auto w-full max-w-3xl">
      <title>Claim Details | AarogyaID</title>

      <Link to="/patient" className={linkClass}>
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
        Back to My Claims
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Claim Details</h1>
        {claim && <ClaimStatusBadge status={claim.status} />}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={24} className="text-violet-600" />
          </div>
        ) : error ? (
          <Card>
            <ErrorState message={error.message} onRetry={retry} />
          </Card>
        ) : (
          <div className="space-y-4">
            <Card padding="md">
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <DetailItem label="Claim Amount">{formatCurrency(claim.claimAmount)}</DetailItem>
                <DetailItem label="Submission Date">{formatDate(claim.submissionDate)}</DetailItem>
                <DetailItem label="Approved Amount">{getApprovedAmountText(claim)}</DetailItem>
                <DetailItem label="Description" className="sm:col-span-2">
                  <span className="block whitespace-pre-wrap break-words">{claim.description}</span>
                </DetailItem>
                {insurerComments && (
                  <DetailItem label="Insurer Comments" className="sm:col-span-2">
                    <span className="block whitespace-pre-wrap break-words">{insurerComments}</span>
                  </DetailItem>
                )}
              </dl>
            </Card>

            <Card padding="md">
              <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
              <div className="mt-3">
                {hasDocuments(claim) ? (
                  <DocumentLinks urls={claim.documentUrl} />
                ) : (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-slate-600">
                      No supporting documents have been uploaded for this claim yet.
                    </p>
                    <Button as={Link} to={`/patient/claims/${claim._id}/upload`} variant="secondary">
                      Upload supporting documents
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}