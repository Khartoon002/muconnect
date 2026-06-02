"use client"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</p>
      <p className="text-gray-500 text-sm mb-6">{error.message || "An unexpected error occurred"}</p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
