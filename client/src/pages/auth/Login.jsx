import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { getRoleHome } from '../../utils/roles'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  return errors
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({ email: '', password: '' })
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
      const user = await login(values.email.trim(), values.password)
      navigate(getRoleHome(user.role), { replace: true })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <title>Log in | AarogyaID</title>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">Access your AarogyaID account.</p>

      <Card padding="md" className="mt-6">
        {submitError && (
          <Alert onDismiss={() => setSubmitError('')} className="mb-4">
            {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            autoComplete="current-password"
            required
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Button type="submit" loading={submitting} className="w-full">
            Log in
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600">
        Don’t have an account?{' '}
        <Link
          to="/register"
          className="rounded-md font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
        >
          Sign up
        </Link>
      </p>
    </section>
  )
}