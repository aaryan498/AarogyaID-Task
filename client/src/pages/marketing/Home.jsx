import { Link } from 'react-router-dom'
import { Check, CircleCheck, ClipboardCheck, FileText } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const STEPS = [
  {
    icon: FileText,
    title: 'Submit a claim',
    description:
      'Patients describe the treatment, enter the amount requested and attach supporting documents.',
  },
  {
    icon: ClipboardCheck,
    title: 'Insurer reviews',
    description: 'The insurer reviews the claim details and the documents that were submitted.',
  },
  {
    icon: CircleCheck,
    title: 'Claim is resolved',
    description:
      'The claim is approved or rejected, with the approved amount and any comments from the reviewer.',
  },
]

const PATIENT_POINTS = [
  'Submit a claim with an amount, a description and supporting documents',
  'Track the status of every claim you have submitted',
  'See the approved amount and the insurer’s comments once a decision is made',
]

const INSURER_POINTS = [
  'Review every submitted claim in one place',
  'Filter claims by status, submission date and claim amount',
  'Approve or reject a claim with an approved amount and comments',
]

function PointList({ items }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
          <Check size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-violet-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Home() {
  return (
    <>
      <title>AarogyaID | Claims Management Platform</title>
      <meta
        name="description"
        content="AarogyaID connects patients and insurers. Patients submit and track medical claims; insurers review, filter, approve or reject them."
      />

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Claims management for patients and insurers
            </h1>
            <p className="mt-4 text-base text-slate-600">
              AarogyaID gives patients a simple way to submit medical claims and follow their
              status, and gives insurers a structured place to review and resolve them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/register">
                Get Started
              </Button>
              <Button as={Link} to="/login" variant="secondary">
                Log In
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <li key={step.title}>
                  <Card padding="md" className="h-full">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                        <Icon size={24} strokeWidth={1.5} />
                      </span>
                      <span className="text-xs font-medium text-slate-500">Step {index + 1}</span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </Card>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-xl font-semibold text-slate-900">Built for both sides</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card padding="md">
              <h3 className="text-base font-semibold text-slate-900">For patients</h3>
              <PointList items={PATIENT_POINTS} />
            </Card>
            <Card padding="md">
              <h3 className="text-base font-semibold text-slate-900">For insurers</h3>
              <PointList items={INSURER_POINTS} />
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}