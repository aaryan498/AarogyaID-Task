export default function DocumentLinks({ urls }) {
  return (
    <ul className="space-y-2">
      {urls.map((url, index) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md text-sm font-medium text-violet-600 underline-offset-4 transition-colors duration-150 hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
          >
            Document {index + 1}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}