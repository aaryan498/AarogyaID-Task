import { Link } from 'react-router-dom'

export default function About() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <title>About | AarogyaID</title>
      <meta
        name="description"
        content="AarogyaID gives patients a simple way to submit and track medical claims, and gives insurers a structured way to review and resolve them."
      />

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">About AarogyaID</h1>
      <p className="mt-4 text-base text-slate-600">
        AarogyaID is a claims management platform for healthcare insurance. It makes one process
        easier to follow from both sides: a patient asking to be reimbursed, and an insurer deciding
        on that request.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">For patients</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Patients can submit a medical claim with the amount requested and a description of the
        treatment, attach supporting documents, and check the status of each claim. Once a decision
        is made, they can see whether the claim was approved or rejected, the approved amount, and
        any comments from the reviewer.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">For insurers</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Insurers see every submitted claim in one place. They can filter claims by status,
        submission date and claim amount, look at the supporting documents, and approve or reject
        each claim with an approved amount and review comments.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Get in touch</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Have a question about the platform? Visit the{' '}
        <Link
          to="/contact"
          className="font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
        >
          contact page
        </Link>
        .
      </p>
    </section>
  )
}