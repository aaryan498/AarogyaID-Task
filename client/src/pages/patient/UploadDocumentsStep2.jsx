import { useState } from 'react'
import clsx from 'clsx'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FileText, Upload, X } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import DocumentLinks from '../../components/claims/DocumentLinks'
import { useClaim } from '../../hooks/useClaims'
import { useToast } from '../../hooks/useToast'
import { uploadClaimDocuments } from '../../lib/claimsApi'
import { hasDocuments } from '../../utils/claims'
import { formatFileSize } from '../../utils/formatters'

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const MAX_FILES = 10 // matches FilesInterceptor('files', 10) on the backend

const linkClass =
  'rounded-md font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600'

function fileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

/** Soft sanity check only; the server remains the source of truth. */
function getRejectionReason(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.has(extension)) return 'unsupported file type'
  if (file.size === 0) return 'empty file'
  return null
}

export default function UploadDocumentsStep2() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: claim, error, isLoading, retry } = useClaim(id)

  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState('')
  const [uploading, setUploading] = useState(false)

  const claimUrl = `/patient/claims/${id}`

  const handleFilesChosen = (event) => {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = '' // allow choosing the same file again later
    if (chosen.length === 0) return

    const rejected = []
    const seen = new Set(files.map(fileKey))
    const fresh = []

    for (const file of chosen) {
      const reason = getRejectionReason(file)
      if (reason) {
        rejected.push(`${file.name} (${reason})`)
        continue
      }
      const key = fileKey(file)
      if (!seen.has(key)) {
        seen.add(key)
        fresh.push(file)
      }
    }

    const room = MAX_FILES - files.length
    const problems = []
    if (rejected.length > 0) problems.push(`Not added: ${rejected.join('; ')}.`)
    if (fresh.length > room) problems.push(`You can upload up to ${MAX_FILES} files at a time.`)

    setFileError(problems.join(' '))
    setFiles([...files, ...fresh.slice(0, room)])
  }

  const removeFile = (target) => {
    setFiles((current) => current.filter((file) => file !== target))
    setFileError('')
  }

  const handleUpload = async () => {
    if (uploading || files.length === 0) return

    setUploading(true)
    try {
      await uploadClaimDocuments(id, files)
      toast.success('Documents uploaded.')
      navigate(claimUrl)
    } catch (uploadError) {
      // Keep the selected files so the patient can retry without reselecting.
      toast.error(uploadError.message)
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <title>Upload Documents | AarogyaID</title>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Upload Supporting Documents
      </h1>
      <p className="mt-2 text-sm text-slate-600">Step 2 of 2 — supporting documents.</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={24} className="text-violet-600" />
          </div>
        ) : error ? (
          <Card>
            <ErrorState message={error.message} onRetry={retry} />
            <p className="pb-4 text-center text-sm">
              <Link to="/patient" className={linkClass}>
                Back to My Claims
              </Link>
            </p>
          </Card>
        ) : (
          <Card padding="md" className="space-y-6">
            {hasDocuments(claim) && (
              <section>
                <h2 className="text-sm font-semibold text-slate-900">Already uploaded</h2>
                <div className="mt-2">
                  <DocumentLinks urls={claim.documentUrl} />
                </div>
              </section>
            )}

            <section>
              <label
                className={clsx(
                  'flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-center',
                  'transition-colors duration-150 hover:border-violet-600 hover:bg-violet-50',
                  'focus-within:ring-2 focus-within:ring-violet-600 focus-within:ring-offset-2',
                  uploading && 'cursor-not-allowed opacity-60',
                )}
              >
                <Upload size={24} strokeWidth={1.5} className="text-violet-600" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-900">Choose files to upload</span>
                <span className="text-xs text-slate-500">
                  PDF, JPG or PNG · up to {MAX_FILES} files
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFilesChosen}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>

              {fileError && (
                <Alert onDismiss={() => setFileError('')} className="mt-3">
                  {fileError}
                </Alert>
              )}

              {files.length > 0 && (
                <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
                  {files.map((file) => (
                    <li key={fileKey(file)} className="flex items-center gap-3 px-3 py-2">
                      <FileText
                        size={20}
                        strokeWidth={1.5}
                        className="shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file)}
                        disabled={uploading}
                        aria-label={`Remove ${file.name}`}
                        className="shrink-0 rounded-md p-1 text-slate-500 transition-colors duration-150 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                as={Link}
                to={claimUrl}
                variant="ghost"
                disabled={uploading}
                onClick={(event) => {
                  if (uploading) event.preventDefault()
                }}
                className="w-full sm:w-auto"
              >
                Skip for now, view claim
              </Button>
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={files.length === 0}
                className="w-full sm:w-auto"
              >
                Upload Documents
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}