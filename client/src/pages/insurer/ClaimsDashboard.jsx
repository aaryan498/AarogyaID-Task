import { useEffect, useState } from 'react'
import { FileText, SearchX } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Spinner from '../../components/ui/Spinner'
import ClaimStatusBadge from '../../components/claims/ClaimStatusBadge'
import ReviewClaimDrawer from '../../components/insurer/ReviewClaimDrawer'
import { useToast } from '../../hooks/useToast'
import { getAllClaims } from '../../lib/claimsApi'
import { formatCurrency, formatDate } from '../../utils/formatters'

const AMOUNT_DEBOUNCE_MS = 400

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
]

const EMPTY_FILTERS = { status: '', fromDate: '', toDate: '', minAmount: '', maxAmount: '' }
const EMPTY_AMOUNTS = { minAmount: '', maxAmount: '' }

/** The backend rejects negative amounts (400), so invalid values are flagged and never sent. */
function getAmountError(value) {
  if (value.trim() === '') return ''
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? '' : 'Enter 0 or more.'
}

export default function ClaimsDashboard() {
  const toast = useToast()

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  // Amounts are debounced (free typing); status and dates apply immediately.
  const [appliedAmounts, setAppliedAmounts] = useState(EMPTY_AMOUNTS)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const [selectedClaim, setSelectedClaim] = useState(null)

  const { minAmount, maxAmount } = filters

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedAmounts((current) =>
        current.minAmount === minAmount && current.maxAmount === maxAmount
          ? current
          : { minAmount, maxAmount },
      )
    }, AMOUNT_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [minAmount, maxAmount])

  // Exactly what is sent to the API. Empty values are omitted by getAllClaims.
  const queryFilters = {
    status: filters.status,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    minAmount: getAmountError(appliedAmounts.minAmount) ? '' : appliedAmounts.minAmount.trim(),
    maxAmount: getAmountError(appliedAmounts.maxAmount) ? '' : appliedAmounts.maxAmount.trim(),
  }
  const filterKey = JSON.stringify(queryFilters)
  const requestKey = `${filterKey}:${attempt}`
  const hasQueryFilters = Object.values(queryFilters).some(Boolean)
  const hasAnyInput = Object.values(filters).some((value) => value.trim() !== '')

  useEffect(() => {
    let ignore = false
    getAllClaims(JSON.parse(filterKey)).then(
      (data) => {
        if (!ignore) {
          setResult({ filterKey, requestKey, data: Array.isArray(data) ? data : [], error: null })
        }
      },
      (error) => {
        if (!ignore) setResult({ filterKey, requestKey, data: null, error })
      },
    )
    return () => {
      ignore = true
    }
  }, [filterKey, requestKey])

  // A result is shown if it belongs to this exact request, or if it is the previous data
  // for the same filters while a refresh (after a decision) is in flight. Changing the
  // filters, or retrying after an error, shows the spinner instead.
  const visible =
    result && (result.requestKey === requestKey || (result.filterKey === filterKey && result.data))
      ? result
      : null
  const isLoading = visible === null
  const claims = visible?.data ?? []

  const refetch = () => setAttempt((count) => count + 1)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleClear = () => {
    setFilters(EMPTY_FILTERS)
    setAppliedAmounts(EMPTY_AMOUNTS)
  }

  const handleUpdated = (updated) => {
    setSelectedClaim(null)
    toast.success(`Claim ${updated?.status?.toLowerCase() ?? 'updated'}.`)
    refetch()
  }

  return (
    <div>
      <title>Claims Dashboard | AarogyaID</title>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Claims Dashboard</h1>

      <Card className="mt-6">
        <section aria-label="Filter claims">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select label="Status" name="status" value={filters.status} onChange={handleChange}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              label="From"
              name="fromDate"
              type="date"
              max={filters.toDate || undefined}
              value={filters.fromDate}
              onChange={handleChange}
            />
            <Input
              label="To"
              name="toDate"
              type="date"
              min={filters.fromDate || undefined}
              value={filters.toDate}
              onChange={handleChange}
            />
            <Input
              label="Min amount (₹)"
              name="minAmount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={filters.minAmount}
              onChange={handleChange}
              error={getAmountError(filters.minAmount)}
            />
            <Input
              label="Max amount (₹)"
              name="maxAmount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={filters.maxAmount}
              onChange={handleChange}
              error={getAmountError(filters.maxAmount)}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={!hasAnyInput}
              className="w-full sm:w-auto"
            >
              Clear filters
            </Button>
          </div>
        </section>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={24} className="text-violet-600" />
          </div>
        ) : visible.error ? (
          <Card>
            <ErrorState message={visible.error.message} onRetry={refetch} />
          </Card>
        ) : claims.length === 0 ? (
          <Card>
            {hasQueryFilters ? (
              <EmptyState
                icon={SearchX}
                title="No claims match these filters"
                description="Try adjusting the filters, or clear them to see every claim."
              >
                <Button variant="secondary" onClick={handleClear}>
                  Clear filters
                </Button>
              </EmptyState>
            ) : (
              <EmptyState
                icon={FileText}
                title="No claims have been submitted yet"
                description="Submitted claims will appear here for review."
              />
            )}
          </Card>
        ) : (
          <>
            {/* md and above: table */}
            <Card padding="none" className="hidden overflow-hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                  <tr>
                    <th scope="col" className="w-1/4 px-3 py-3">
                      Patient Name
                    </th>
                    <th scope="col" className="w-1/3 px-3 py-3">
                      Email
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
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {claims.map((claim) => (
                    <tr key={claim._id}>
                      <td className="max-w-0 px-3 py-3 align-middle">
                        <p className="truncate text-slate-900" title={claim.name}>
                          {claim.name}
                        </p>
                      </td>
                      <td className="max-w-0 px-3 py-3 align-middle">
                        <p className="truncate text-slate-700" title={claim.email}>
                          {claim.email}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle tabular-nums text-slate-900">
                        {formatCurrency(claim.claimAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle">
                        <ClaimStatusBadge status={claim.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-slate-700">
                        {formatDate(claim.submissionDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right align-middle">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedClaim(claim)}
                          aria-label={`Review claim from ${claim.name}, submitted ${formatDate(claim.submissionDate)}`}
                        >
                          Review
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
                    <p className="mt-3 break-words text-sm font-medium text-slate-900">
                      {claim.name}
                    </p>
                    <p className="mt-0.5 break-all text-xs text-slate-600">{claim.email}</p>
                    <dl className="mt-3">
                      <dt className="text-xs font-medium text-slate-500">Amount</dt>
                      <dd className="mt-0.5 text-sm text-slate-900">
                        {formatCurrency(claim.claimAmount)}
                      </dd>
                    </dl>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedClaim(claim)}
                      aria-label={`Review claim from ${claim.name}, submitted ${formatDate(claim.submissionDate)}`}
                      className="mt-4 w-full"
                    >
                      Review
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ReviewClaimDrawer
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
        onUpdated={handleUpdated}
      />
    </div>
  )
}