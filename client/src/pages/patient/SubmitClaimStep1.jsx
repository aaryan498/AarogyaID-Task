import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { createClaim } from '../../lib/claimsApi'

function validate({ claimAmount, description }) {
  const errors = {}
  const amount = Number(claimAmount)

  if (claimAmount.trim() === '') errors.claimAmount = 'Claim amount is required.'
  else if (!Number.isFinite(amount) || amount <= 0) {
    errors.claimAmount = 'Enter an amount greater than 0.'
  }
  if (!description.trim()) errors.description = 'Description is required.'

  return errors
}

export default function SubmitClaimStep1() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [values, setValues] = useState({ claimAmount: '', description: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      // Claims are matched to a patient by exact email, so name/email always come
      // from the authenticated user, never from form input.
      const claim = await createClaim({
        name: user.name,
        email: user.email,
        claimAmount: Number(values.claimAmount),
        description: values.description.trim(),
      })
      // `replace` so Back from step 2 doesn't return to an empty form and create a duplicate claim.
      navigate(`/patient/claims/${claim._id}/upload`, { replace: true })
    } catch (error) {
      toast.error(error.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <title>Submit a Claim | AarogyaID</title>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Submit a Claim</h1>
      <p className="mt-2 text-sm text-slate-600">
        Step 1 of 2 — claim details. You’ll upload supporting documents next.
      </p>

      <Card padding="md" className="mt-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Full name" name="name" value={user.name} disabled readOnly />
          <Input label="Email" name="email" type="email" value={user.email} disabled readOnly />
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock size={16} strokeWidth={1.5} aria-hidden="true" />
            These details come from your account and can’t be edited here.
          </p>

          <Input
            label="Claim amount (₹)"
            name="claimAmount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            required
            value={values.claimAmount}
            onChange={handleChange}
            error={errors.claimAmount}
          />

          <Textarea
            label="Description"
            name="description"
            required
            hint="Describe the treatment or expense you are claiming for."
            value={values.description}
            onChange={handleChange}
            error={errors.description}
          />

          <Button type="submit" loading={submitting} className="w-full sm:w-auto">
            Continue to document upload
          </Button>
        </form>
      </Card>
    </div>
  )
}