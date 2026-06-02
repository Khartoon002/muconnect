"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Loader2, Users, Search, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

interface Student {
  id: string
  name: string
  email: string
  matricNumber: string | null
  department: string | null
  faculty: string | null
  level: number | null
  phone: string | null
  createdAt: string
  _count: { courses: number; results: number; feePayments: number }
}

const LEVEL_COLORS: Record<number, string> = {
  100: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  200: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  300: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
  400: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  500: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [levelFilter, setLevelFilter] = useState("all")

  const fetchStudents = useCallback(async () => {
    try {
      const data = await fetch("/api/admin/students").then(r => r.json())
      setStudents(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const levels = [...new Set(students.map(s => s.level).filter(Boolean) as number[])].sort()

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || s.name.toLowerCase().includes(q)
      || (s.email.toLowerCase().includes(q))
      || (s.matricNumber?.toLowerCase().includes(q) ?? false)
      || (s.department?.toLowerCase().includes(q) ?? false)
    const matchLevel = levelFilter === "all" || String(s.level) === levelFilter
    return matchSearch && matchLevel
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Student Management</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">{students.length} enrolled students</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" strokeWidth={2.5} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, matric, email, department…"
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          className="px-3 py-2.5 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Levels</option>
          {levels.map(l => <option key={l} value={l}>Level {l}</option>)}
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
            <Users className="w-10 h-10 text-[var(--muted)] mx-auto mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-[var(--muted)] text-sm">{search || levelFilter !== "all" ? "No students match the filter" : "No students found"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
                <tr>
                  {["Student", "Matric No.", "Department", "Level", "Courses", "Joined"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{s.name}</p>
                          <p className="text-xs text-[var(--muted)]">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {s.matricNumber ?? <span className="text-[var(--muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs">{s.department ?? "—"}</td>
                    <td className="px-4 py-3">
                      {s.level ? (
                        <span className={cn("px-2 py-0.5 rounded-lg text-xs font-semibold", LEVEL_COLORS[s.level] ?? LEVEL_COLORS[100])}>
                          {s.level}
                        </span>
                      ) : <span className="text-[var(--muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs text-[var(--muted)]">
                        <span>{s._count.courses} reg.</span>
                        <span>·</span>
                        <span>{s._count.results} results</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {new Date(s.createdAt).toLocaleDateString("en-NG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--muted)]">Showing {filtered.length} of {students.length} students</p>
    </div>
  )
}
