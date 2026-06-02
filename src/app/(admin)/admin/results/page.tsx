"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, FileText, Send, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const schema = z.object({
  studentId: z.string().min(1, "Select a student"),
  courseId:  z.string().min(1, "Select a course"),
  score:     z.coerce.number().min(0, "Min 0").max(100, "Max 100"),
  session:   z.string().regex(/^\d{4}\/\d{4}$/, "e.g. 2024/2025"),
  semester:  z.coerce.number().int().min(1).max(2),
})
type FormData = z.infer<typeof schema>

interface Student { id: string; name: string; matricNumber: string | null; department: string | null }
interface Course  { id: string; code: string; title: string; units: number }
interface Result  {
  id: string; score: number; grade: string; session: string; semester: number
  user:   { name: string; matricNumber: string | null }
  course: { code: string; title: string; units: number }
}

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
  B: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  C: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400",
  D: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400",
  E: "bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300",
  F: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
}

function scorePreview(score: number | string) {
  const n = Number(score)
  if (isNaN(n)) return null
  if (n >= 70) return { grade: "A", label: "Excellent" }
  if (n >= 60) return { grade: "B", label: "Good" }
  if (n >= 50) return { grade: "C", label: "Average" }
  if (n >= 45) return { grade: "D", label: "Below Average" }
  if (n >= 40) return { grade: "E", label: "Poor" }
  return { grade: "F", label: "Fail" }
}

const inputCls = (err: boolean) => cn(
  "w-full px-3 py-2.5 border rounded-xl text-sm bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)]",
  "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow",
  err ? "border-red-400" : "border-[var(--card-border)]"
)

export default function ResultsAdminPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses,  setCourses]  = useState<Course[]>([])
  const [results,  setResults]  = useState<Result[]>([])
  const [loading,  setLoading]  = useState(true)

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { session: "2024/2025", semester: 1 },
  })

  const scoreVal = watch("score")
  const preview  = scorePreview(scoreVal)

  const fetchAll = useCallback(async () => {
    try {
      const [s, c, r] = await Promise.all([
        fetch("/api/admin/students").then(x => x.json()),
        fetch("/api/admin/courses").then(x => x.json()),
        fetch("/api/admin/results").then(x => x.json()),
      ])
      setStudents(Array.isArray(s) ? s : [])
      setCourses(Array.isArray(c)  ? c : [])
      setResults(Array.isArray(r)  ? r : [])
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to upload result")
      toast.success("Result uploaded and student notified!")
      reset({ session: "2024/2025", semester: 1 })
      fetchAll()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Results Entry</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Upload results — students are notified automatically</p>
      </div>

      {/* Entry form */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">Upload Result</h2>
            <p className="text-xs text-[var(--muted)]">Grade is calculated automatically from score</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Student</label>
            <select {...register("studentId")} className={inputCls(!!errors.studentId)}>
              <option value="">Select student…</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.matricNumber ? ` (${s.matricNumber})` : ""}
                </option>
              ))}
            </select>
            {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Course</label>
            <select {...register("courseId")} className={inputCls(!!errors.courseId)}>
              <option value="">Select course…</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
            {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Score (0 – 100)</label>
            <div className="relative">
              <input
                {...register("score")}
                type="number"
                min={0}
                max={100}
                step={0.5}
                placeholder="e.g. 75"
                className={cn(inputCls(!!errors.score), "pr-28")}
              />
              {preview && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className={cn("px-2 py-0.5 rounded-lg text-xs font-bold", GRADE_COLORS[preview.grade] ?? "")}>
                    {preview.grade}
                  </span>
                  <span className="text-xs text-[var(--muted)] hidden sm:block">{preview.label}</span>
                </div>
              )}
            </div>
            {errors.score && <p className="text-red-500 text-xs mt-1">{errors.score.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Session</label>
              <input {...register("session")} placeholder="2024/2025" className={inputCls(!!errors.session)} />
              {errors.session && <p className="text-red-500 text-xs mt-1">{errors.session.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Semester</label>
              <select {...register("semester")} className={inputCls(false)}>
                <option value={1}>Sem 1</option>
                <option value={2}>Sem 2</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors active:scale-[0.98]"
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</>
                : <><Send className="w-4 h-4" strokeWidth={2.5} />Upload Result</>
              }
            </button>
          </div>
        </form>
      </div>

      {/* Grade scale reference */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[var(--muted)]" strokeWidth={2.5} />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Grading Scale</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { range: "70–100", grade: "A", pts: 5 },
            { range: "60–69",  grade: "B", pts: 4 },
            { range: "50–59",  grade: "C", pts: 3 },
            { range: "45–49",  grade: "D", pts: 2 },
            { range: "40–44",  grade: "E", pts: 1 },
            { range: "0–39",   grade: "F", pts: 0 },
          ].map(g => (
            <div key={g.grade} className="flex items-center gap-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-3 py-2">
              <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold", GRADE_COLORS[g.grade])}>
                {g.grade}
              </span>
              <div className="text-xs">
                <p className="font-medium text-[var(--foreground)]">{g.range}</p>
                <p className="text-[var(--muted)]">{g.pts} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent results */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--card-border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Recent Uploads</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{results.length} results on record</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-[var(--muted)] text-sm">No results uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
                <tr>
                  {["Student", "Course", "Score", "Grade", "Session", "Sem"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {results.slice(0, 50).map(r => (
                  <tr key={r.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{r.user.name}</p>
                      <p className="text-xs text-[var(--muted)]">{r.user.matricNumber ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold text-blue-600 dark:text-blue-400 text-xs">{r.course.code}</p>
                      <p className="text-xs text-[var(--muted)] truncate max-w-[160px]">{r.course.title}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{r.score}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-lg text-xs font-bold", GRADE_COLORS[r.grade] ?? "")}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">{r.session}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">{r.semester}</td>
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
