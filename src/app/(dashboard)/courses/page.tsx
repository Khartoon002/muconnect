"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { BookOpen, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  code: string
  title: string
  units: number
  semester: number
  session: string
  enrollments: { id: string }[]
}

interface Enrollment {
  id: string
  courseId: string
  session: string
  semester: number
  course: { code: string; title: string; units: number }
}

const MAX_UNITS = 24

export default function CoursesPage() {
  const [tab, setTab] = useState<"available" | "registered">("available")
  const [available, setAvailable] = useState<Course[]>([])
  const [registered, setRegistered] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [av, reg] = await Promise.all([
        fetch("/api/courses/available").then((r) => r.json()),
        fetch("/api/courses/enrolled").then((r) => r.json()),
      ])
      setAvailable(Array.isArray(av) ? av : [])
      setRegistered(Array.isArray(reg) ? reg : [])
    } catch {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function enroll(courseId: string) {
    setEnrolling(courseId)
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Enrollment failed")
      }
      toast.success("Course registered successfully!")
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnrolling(null)
    }
  }

  const isRegistered = (courseId: string) => registered.some((r) => r.courseId === courseId)
  const totalUnits = registered.reduce((s, r) => s + r.course.units, 0)
  const overload = totalUnits > MAX_UNITS

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Course Registration</h1>
        <p className="text-sm text-[var(--muted)] mt-1">2024/2025 Academic Session</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--card-border)]">
        {(["available", "registered"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors",
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {t === "available" ? "Available Courses" : `My Courses (${registered.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : tab === "available" ? (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
                <tr>
                  {["Code", "Title", "Units", "Semester", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {available.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <BookOpen className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-40" strokeWidth={1.5} />
                      <p className="text-[var(--muted)] text-sm">No courses available for your department / level</p>
                    </td>
                  </tr>
                ) : available.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400 text-sm">{c.code}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]">{c.title}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{c.units} unit{c.units !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">Sem {c.semester}</td>
                    <td className="px-4 py-3">
                      {isRegistered(c.id) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium">
                          <CheckCircle className="w-3 h-3" strokeWidth={2.5} /> Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => enroll(c.id)}
                          disabled={enrolling === c.id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          {enrolling === c.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Register
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {overload && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" strokeWidth={2.5} />
              <p className="text-sm text-red-700 dark:text-red-400">
                You have exceeded the {MAX_UNITS}-unit limit. Please contact your department.
              </p>
            </div>
          )}

          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
                  <tr>
                    {["Code", "Title", "Units", "Semester", "Session"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {registered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <p className="text-[var(--muted)] text-sm">No courses registered yet</p>
                      </td>
                    </tr>
                  ) : registered.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{r.course.code}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{r.course.title}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{r.course.units}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">Sem {r.semester}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{r.session}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={cn(
            "rounded-xl px-5 py-3 flex items-center justify-between border",
            overload
              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
              : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
          )}>
            <span className={cn("text-sm font-medium", overload ? "text-red-700 dark:text-red-400" : "text-blue-700 dark:text-blue-300")}>
              Total Registered Units
            </span>
            <span className={cn("font-bold text-lg", overload ? "text-red-900 dark:text-red-300" : "text-blue-900 dark:text-blue-200")}>
              {totalUnits} / {MAX_UNITS}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
