"use client"

import { useState, useEffect } from "react"
import { calculateGPA } from "@/lib/gpa"
import { Loader2, Printer, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ResultEntry {
  id: string
  score: number
  grade: string
  session: string
  semester: number
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

const GRADE_POINTS: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }

function gradeLabel(gpa: number) {
  if (gpa >= 4.5) return "First Class"
  if (gpa >= 3.5) return "Second Class Upper"
  if (gpa >= 2.5) return "Second Class Lower"
  if (gpa >= 1.5) return "Third Class"
  return "Pass"
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSession, setFilterSession] = useState("all")
  const [filterSemester, setFilterSemester] = useState("all")

  useEffect(() => {
    fetch("/api/results")
      .then((r) => r.json())
      .then((d) => { setResults(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { toast.error("Failed to load results"); setLoading(false) })
  }, [])

  const sessions = [...new Set(results.map((r) => r.session))]
  const filtered = results.filter(
    (r) =>
      (filterSession === "all" || r.session === filterSession) &&
      (filterSemester === "all" || String(r.semester) === filterSemester)
  )

  const gpa = calculateGPA(filtered)
  const cumGpa = calculateGPA(results)
  const totalUnits = filtered.reduce((s, r) => s + r.course.units, 0)
  const totalPoints = filtered.reduce((s, r) => s + (GRADE_POINTS[r.grade] ?? 0) * r.course.units, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-5 print:p-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Academic Results</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{results.length} result{results.length !== 1 ? "s" : ""} on record</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] hover:bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors"
        >
          <Printer className="w-4 h-4" strokeWidth={2.5} /> Print Transcript
        </button>
      </div>

      {/* CGPA banner */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-5 text-white">
          <p className="text-green-100 text-sm">Cumulative GPA</p>
          <p className="text-4xl font-bold mt-1">{cumGpa > 0 ? cumGpa.toFixed(2) : "N/A"}</p>
          {cumGpa > 0 && <p className="text-green-200 text-xs mt-1">{gradeLabel(cumGpa)}</p>}
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Current Filter GPA</p>
            <p className="text-3xl font-bold text-[var(--foreground)]">{filtered.length > 0 ? gpa.toFixed(2) : "—"}</p>
            <p className="text-xs text-[var(--muted)]">{totalUnits} units · {filtered.length} courses</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap print:hidden">
        <select
          value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}
          className="px-3 py-2 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Sessions</option>
          {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="px-3 py-2 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
      </div>

      {/* Results table */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
              <tr>
                {["Course Code", "Title", "Units", "Score", "Grade", "Points"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">
                    No results found for the selected filter
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{r.course.code}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{r.course.title}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{r.course.units}</td>
                  <td className="px-4 py-3 text-[var(--foreground)] font-medium">{r.score}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-lg text-xs font-bold", GRADE_COLORS[r.grade] ?? "bg-[var(--background)] text-[var(--muted)]")}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{(GRADE_POINTS[r.grade] ?? 0) * r.course.units}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-[var(--background)] border-t-2 border-[var(--card-border)]">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-semibold text-[var(--foreground)]">Total / GPA</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{totalUnits}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{gpa.toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{totalPoints}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
