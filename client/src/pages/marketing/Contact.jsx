import { Mail } from 'lucide-react'
import Card from '../../components/ui/Card'

const SUPPORT_EMAIL = 'support@aarogyaid.com'

export default function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <title>Contact | AarogyaID</title>
      <meta name="description" content="Contact the AarogyaID team by email." />

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Contact</h1>

      <Card padding="md" className="mt-8">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-600">
            <Mail size={24} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">Support</h2>
            <p className="mt-1 text-sm text-slate-600">
              Have a question about AarogyaID? Send us an email.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-3 inline-block break-all rounded-md text-sm font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </Card>
    </section>
  )
}