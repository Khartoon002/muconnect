import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-blue-600">404</h1>
        <p className="text-xl font-semibold text-[var(--foreground)] mt-4">Page not found</p>
        <p className="text-[var(--muted)] mt-2">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
