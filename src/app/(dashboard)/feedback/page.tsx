"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"

const schema = z.object({
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(20, "Message must be at least 20 characters"),
})
type FormData = z.infer<typeof schema>

interface FeedbackEntry {
  id: string
  category: string
  message: string
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  OPEN:          "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  "IN PROGRESS": "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400",
  RESOLVED:      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
}

const CATEGORIES = [
  "Technical Issue",
  "Registration Problem",
  "Fee Issue",
  "General Suggestion",
  "Other",
]

const inputCls = (err: boolean) => cn(
  "w-full px-3 py-2.5 border rounded-xl text-sm bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)]",
  "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow",
  err ? "border-red-400" : "border-[var(--card-border)]"
)

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const messageValue = watch("message") ?? ""

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback")
      const data = await res.json()
      setFeedbacks(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeedbacks() }, [fetchFeedbacks])

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast.success("Feedback submitted!")
      reset()
      fetchFeedbacks()
    } catch {
      toast.error("Failed to submit feedback")
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Feedback & Suggestions</h1>
        <p className="text-sm text-[var(--muted)] mt-1">We read every submission and aim to respond within 48 hours.</p>
      </div>

      {/* Submission form */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">New Submission</h2>
            <p className="text-xs text-[var(--muted)]">Your feedback helps us improve the portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Category</label>
            <select {...register("category")} className={inputCls(!!errors.category)}>
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Message</label>
              <span className={cn("text-xs", messageValue.length < 20 ? "text-[var(--muted)]" : "text-green-600 dark:text-green-400")}>
                {messageValue.length} / 500
              </span>
            </div>
            <textarea
              {...register("message")}
              rows={5}
              maxLength={500}
              placeholder="Describe your issue or suggestion in detail..."
              className={cn(inputCls(!!errors.message), "resize-none")}
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
              : <><Send className="w-4 h-4" strokeWidth={2.5} />Submit Feedback</>
            }
          </button>
        </form>
      </div>

      {/* My submissions */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--card-border)]">
          <h2 className="font-semibold text-[var(--foreground)]">My Submissions</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{feedbacks.length} submission{feedbacks.length !== 1 ? "s" : ""}</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-[var(--muted)] text-sm">No submissions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {feedbacks.map((f) => (
              <div key={f.id} className="px-5 py-4 hover:bg-[var(--background)] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--foreground)] bg-[var(--background)] border border-[var(--card-border)] px-2 py-0.5 rounded-lg">
                        {f.category}
                      </span>
                      <span className={cn("px-2 py-0.5 rounded-lg text-xs font-medium", STATUS_COLORS[f.status] ?? STATUS_COLORS.OPEN)}>
                        {f.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground)] line-clamp-2">{f.message}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{new Date(f.createdAt).toLocaleDateString("en-NG")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
