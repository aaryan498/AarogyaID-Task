import { Link } from 'react-router-dom'
import { FileText, Plus, TriangleAlert } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import ClaimStatusBadge from '../../components/claims/ClaimStatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { useClaims } from '../../hooks/useClaims'
import { getApprovedAmountText, hasDocuments } from '../../utils/claims'
import { formatCurrency, formatDate } from '../../utils/formatters'

const linkClass =
  'rounded-md font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600'

function MissingDocumentsNotice({ claimId }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-amber-700">
      <span className="inline-flex items-center gap-1">
        <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" />
        Documents not uploaded yet
      </span>
      <Link to={`/patient/claims/${claimId}/upload`} className={linkClass}>
        Upload documents
      </Link>
    </p>
  )
}

export default function MyClaims() {
  const { user } = useAuth()
  const { data, error, isLoading, retry } = useClaims(user.email)
  const claims = Array.isArray(data) ? data : []

  return (
    <div>
      <title>My Claims | AarogyaID</title>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Claims</h1>
        {claims.length > 0 && (
          <Button as={Link} to="/patient/claims/new" className="w-full sm:w-auto">
            <Plus size={20} strokeWidth={1.5} />
            Submit New Claim
          </Button>
        )}
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
        ) : claims.length === 0 ? (
          <Card>
            <EmptyState
              icon={FileText}
              title="You haven’t submitted any claims yet"
              description="Submit a claim and follow its status here."
            >
              <Button as={Link} to="/patient/claims/new">
                Submit your first claim
              </Button>
            </EmptyState>
          </Card>
        ) : (
          <>
            {/* md and above: table */}
            <Card padding="none" className="hidden overflow-hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                  <tr>
                    <th scope="col" className="px-3 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Submitted
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Approved Amount
                    </th>
                    <th scope="col" className="px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {claims.map((claim) => (
                    <tr key={claim._id}>
                      <td className="w-full max-w-0 px-3 py-3 align-top">
                        <p className="truncate text-slate-900" title={claim.description}>
                          {claim.description}
                        </p>
                        {!hasDocuments(claim) && (
                          <div className="mt-1">
                            <MissingDocumentsNotice claimId={claim._id} />
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-top tabular-nums text-slate-900">
                        {formatCurrency(claim.claimAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-top">
                        <ClaimStatusBadge status={claim.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-top text-slate-700">
                        {formatDate(claim.submissionDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-top text-slate-700">
                        {getApprovedAmountText(claim)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right align-top">
                        <Button
                          as={Link}
                          to={`/patient/claims/${claim._id}`}
                          variant="secondary"
                          size="sm"
                          aria-label={`View claim submitted ${formatDate(claim.submissionDate)}`}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* below md: stacked cards */}
            <ul className="space-y-3 md:hidden">
              {claims.map((claim) => (
                <li key={claim._id}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <ClaimStatusBadge status={claim.status} />
                      <span className="text-xs text-slate-500">
                        {formatDate(claim.submissionDate)}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 break-words text-sm text-slate-900">
                      {claim.description}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs font-medium text-slate-500">Amount</dt>
                        <dd className="mt-0.5 text-slate-900">{formatCurrency(claim.claimAmount)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-slate-500">Approved Amount</dt>
                        <dd className="mt-0.5 text-slate-900">{getApprovedAmountText(claim)}</dd>
                      </div>
                    </dl>
                    {!hasDocuments(claim) && (
                      <div className="mt-3">
                        <MissingDocumentsNotice claimId={claim._id} />
                      </div>
                    )}
                    <Button
                      as={Link}
                      to={`/patient/claims/${claim._id}`}
                      variant="secondary"
                      size="sm"
                      className="mt-4 w-full"
                    >
                      View
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}