"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Loader2, MessageSquare, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackEntry {
  id: string
  category: string
  message: string
  status: string
  createdAt: string
  user: { name: string; email: string }
}

const STATUS_COLORS: Record<string, string> = {
  OPEN:          "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  "IN PROGRESS": "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400",
  RESOLVED:      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
}

const STATUS_OPTIONS = ["OPEN", "IN PROGRESS", "RESOLVED"] as const

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("ALL")

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/feedback")
      const data = await res.json()
      setFeedbacks(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load feedback")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeedbacks() }, [fetchFeedbacks])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, status } : f))
      toast.success("Status updated")
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filterStatus === "ALL" ? feedbacks : feedbacks.filter(f => f.status === filterStatus)
  const openCount = feedbacks.filter(f => f.status === "OPEN").length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Manage Feedback</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">{openCount} open item{openCount !== 1 ? "s" : ""} need attention</p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-[var(--muted)]" strokeWidth={2.5} />
        {["ALL", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              filterStatus === s
                ? "bg-blue-600 text-white"
                : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {s === "ALL" ? `All (${feedbacks.length})` : s}
          </button>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-[var(--muted)] text-sm">No feedback submissions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
                <tr>
                  {["Student", "Category", "Message", "Status", "Date", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{f.user.name}</p>
                      <p className="text-xs text-[var(--muted)]">{f.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)]">{f.category}</td>
                    <td className="px-4 py-3 text-[var(--muted)] max-w-xs">
                      <p className="truncate" title={f.message}>{f.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-lg text-xs font-medium", STATUS_COLORS[f.status] ?? STATUS_COLORS.OPEN)}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs">
                      {new Date(f.createdAt).toLocaleDateString("en-NG")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={f.status}
                        disabled={updating === f.id}
                        onChange={(e) => updateStatus(f.id, e.target.value)}
                        className="px-2 py-1.5 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
