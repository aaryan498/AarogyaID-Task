import { useState } from 'react'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { getRoleHome } from '../../utils/roles'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const MIN_PASSWORD_LENGTH = 6

const ROLE_OPTIONS = [
  { value: 'PATIENT', label: 'Patient' },
  { value: 'INSURER', label: 'Insurer' },
]

function validate({ name, email, password, confirmPassword }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Full name is required.'
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
  }
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [role, setRole] = useState('PATIENT')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role,
      })
      navigate(getRoleHome(role), { replace: true })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <title>Sign up | AarogyaID</title>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create an account</h1>
      <p className="mt-2 text-sm text-slate-600">Register as a patient or an insurer.</p>

      <Card padding="md" className="mt-6">
        {submitError && (
          <Alert onDismiss={() => setSubmitError('')} className="mb-4">
            {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">
              I am registering as
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((option) => {
                const selected = role === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRole(option.value)}
                    className={clsx(
                      'inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2',
                      selected
                        ? 'border-violet-600 bg-violet-50 text-slate-900'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    {selected && <Check size={16} strokeWidth={1.5} className="text-violet-600" />}
                    {option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <Button type="submit" loading={submitting} className="w-full">
            Create account
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="rounded-md font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
        >
          Log in
        </Link>
      </p>
    </section>
  )
}