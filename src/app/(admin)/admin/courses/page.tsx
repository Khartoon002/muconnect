"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, BookOpen, Plus, X, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const schema = z.object({
  code:       z.string().min(3, "Required").max(20),
  title:      z.string().min(3, "Required"),
  units:      z.coerce.number().int().min(1).max(6),
  department: z.string().min(2, "Required"),
  level:      z.coerce.number().int().min(100).max(900),
  semester:   z.coerce.number().int().min(1).max(2),
  session:    z.string().regex(/^\d{4}\/\d{4}$/, "e.g. 2024/2025"),
})
type FormData = z.infer<typeof schema>

interface Course {
  id: string
  code: string
  title: string
  units: number
  department: string
  level: number
  semester: number
  session: string
  _count: { enrollments: number }
}

const inputCls = (err: boolean) => cn(
  "w-full px-3 py-2.5 border rounded-xl text-sm bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)]",
  "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow",
  err ? "border-red-400" : "border-[var(--card-border)]"
)

export default function CoursesAdminPage() {
  const [courses, setCourses]     = useState<Course[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [search, setSearch]       = useState("")
  const [deptFilter, setDeptFilter] = useState("all")

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { units: 3, level: 300, semester: 1, session: "2024/2025" },
  })

  const fetchCourses = useCallback(async () => {
    try {
      const data = await fetch("/api/admin/courses").then(r => r.json())
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, code: data.code.toUpperCase() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Failed to create course")
      toast.success("Course created!")
      reset()
      setShowForm(false)
      fetchCourses()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const departments = [...new Set(courses.map(c => c.department))].sort()
  const filtered = courses.filter(c => {
    const q = search.toLowerCase()
    const matchS = !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    const matchD = deptFilter === "all" || c.department === deptFilter
    return matchS && matchD
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Course Management</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{courses.length} courses in the system</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          {showForm ? <X className="w-4 h-4" strokeWidth={2.5} /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
          {showForm ? "Cancel" : "Add Course"}
        </button>
      </div>

      {/* Add course form */}
      {showForm && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 animate-fade-up">
          <h2 className="font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" strokeWidth={2.5} /> New Course
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Course Code</label>
              <input {...register("code")} placeholder="e.g. CSC 301" className={inputCls(!!errors.code)} />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Course Title</label>
              <input {...register("title")} placeholder="e.g. Data Structures and Algorithms" className={inputCls(!!errors.title)} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Department</label>
              <input {...register("department")} placeholder="e.g. Computer Science" className={inputCls(!!errors.department)} />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Level</label>
              <select {...register("level")} className={inputCls(!!errors.level)}>
                {[100,200,300,400,500].map(l => <option key={l} value={l}>{l} Level</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Units</label>
              <select {...register("units")} className={inputCls(!!errors.units)}>
                {[1,2,3,4,5,6].map(u => <option key={u} value={u}>{u} unit{u !== 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Semester</label>
              <select {...register("semester")} className={inputCls(false)}>
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase mb-1.5">Session</label>
              <input {...register("session")} placeholder="2024/2025" className={inputCls(!!errors.session)} />
              {errors.session && <p className="text-red-500 text-xs mt-1">{errors.session.message}</p>}
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search code or title…"
          className="flex-1 px-4 py-2.5 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2.5 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-[var(--muted)] text-sm">No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
                <tr>
                  {["Code", "Title", "Dept", "Level", "Sem", "Units", "Enrolled"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{c.code}</td>
                    <td className="px-4 py-3 text-[var(--foreground)] max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs">{c.department}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg text-xs font-semibold">
                        {c.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">Sem {c.semester}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{c.units}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Users className="w-3 h-3" strokeWidth={2.5} /> {c._count.enrollments}
                      </span>
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
