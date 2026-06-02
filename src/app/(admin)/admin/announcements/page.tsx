"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Megaphone, Send } from "lucide-react"
import { cn } from "@/lib/utils"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  body: z.string().min(10, "Body must be at least 10 characters").max(2000),
  targetRole: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Announcement {
  id: string
  title: string
  body: string
  targetRole: string | null
  publishedAt: string
  createdAt: string
}

const inputCls = (err: boolean) => cn(
  "w-full px-3 py-2.5 border rounded-xl text-sm bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)]",
  "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow",
  err ? "border-red-400" : "border-[var(--card-border)]"
)

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const bodyValue = watch("body") ?? ""

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/announcements")
      const data = await res.json()
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast.success("Announcement published!")
      reset()
      fetchAnnouncements()
    } catch {
      toast.error("Failed to publish announcement")
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Announcements</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Published announcements appear on all student dashboards.</p>
      </div>

      {/* Post form */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">New Announcement</h2>
            <p className="text-xs text-[var(--muted)]">Will notify all targeted users</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Title</label>
            <input
              {...register("title")}
              className={inputCls(!!errors.title)}
              placeholder="e.g. End of Semester Examination Timetable"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Message</label>
              <span className="text-xs text-[var(--muted)]">{bodyValue.length} / 2000</span>
            </div>
            <textarea
              {...register("body")}
              rows={5}
              maxLength={2000}
              className={cn(inputCls(!!errors.body), "resize-none")}
              placeholder="Announcement details..."
            />
            {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Target Audience</label>
            <select {...register("targetRole")} className={inputCls(false)}>
              <option value="">All Users</option>
              <option value="STUDENT">Students Only</option>
              <option value="LECTURER">Lecturers Only</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
              : <><Send className="w-4 h-4" strokeWidth={2.5} />Publish Announcement</>
            }
          </button>
        </form>
      </div>

      {/* Announcements list */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--card-border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Published Announcements</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{announcements.length} total</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center">
            <Megaphone className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-[var(--muted)] text-sm">No announcements yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {announcements.map((a) => (
              <div key={a.id} className="px-5 py-4 hover:bg-[var(--background)] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--foreground)]">{a.title}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{a.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] bg-[var(--background)] border border-[var(--card-border)] px-2 py-0.5 rounded-full text-[var(--muted)] font-medium">
                      {a.targetRole ?? "All"}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {new Date(a.publishedAt).toLocaleDateString("en-NG")}
                    </span>
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
