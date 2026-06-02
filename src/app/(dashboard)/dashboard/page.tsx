import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { calculateGPA } from "@/lib/gpa"
import { BookOpen, TrendingUp, CreditCard, Bell, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard — M-Connect" }

const CURRENT_SESSION = "2024/2025"

function StatCard({
  label, value, icon: Icon, color, href,
}: { label: string; value: string; icon: any; color: string; href?: string }) {
  const inner = (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
      </div>
      {href && <ArrowRight className="w-4 h-4 text-[var(--muted)] shrink-0" strokeWidth={2.5} />}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [user, enrollments, results, fees, notifications, announcements] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.courseEnrollment.count({ where: { userId: session.user.id } }),
    prisma.result.findMany({ where: { userId: session.user.id }, include: { course: true } }),
    prisma.feePayment.findMany({ where: { userId: session.user.id, session: CURRENT_SESSION } }),
    prisma.notification.findMany({
      where: { userId: session.user.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.announcement.findMany({ orderBy: { publishedAt: "desc" }, take: 5 }),
  ])

  const gpa = calculateGPA(results)
  const hasPaid = fees.some((f) => f.status === "PAID")
  const unreadCount = notifications.length
  const now = new Date()

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm font-medium">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-1">{user?.name ?? "Student"}</h1>
        <p className="text-blue-200 text-sm mt-1">
          {now.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        {user?.matricNumber && (
          <p className="text-blue-100 text-xs mt-2 font-mono">
            {user.matricNumber} · {user.department} · {user.level ? `Level ${user.level}` : ""} · {CURRENT_SESSION}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Courses" value={String(enrollments)}
          icon={BookOpen} color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          href="/courses"
        />
        <StatCard
          label="Cumulative GPA" value={gpa > 0 ? gpa.toFixed(2) : "N/A"}
          icon={TrendingUp} color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
          href="/results"
        />
        <StatCard
          label="Fee Status" value={hasPaid ? "Paid" : "Unpaid"}
          icon={CreditCard}
          color={hasPaid
            ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}
          href="/fees"
        />
        <StatCard
          label="Unread Notifications" value={String(unreadCount)}
          icon={Bell} color="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
          href="/notifications"
        />
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)]">Recent Announcements</h2>
            <Link href="/notifications" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">No announcements yet.</p>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="border-b border-[var(--card-border)] pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-sm text-[var(--foreground)]">{a.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{a.body}</p>
                  <p className="text-xs text-[var(--muted)] mt-1 opacity-70">
                    {new Date(a.publishedAt).toLocaleDateString("en-NG")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)]">Unread Notifications</h2>
            <Link href="/notifications" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">You're all caught up!</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-3 border-b border-[var(--card-border)] pb-3 last:border-0 last:pb-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-[var(--foreground)]">{n.title}</p>
                    <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">{n.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/courses",       label: "Register Courses", color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/40" },
          { href: "/results",       label: "View Results",     color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40" },
          { href: "/fees",          label: "Pay Fees",         color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/40" },
          { href: "/feedback",      label: "Submit Feedback",  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className={`${q.bg} ${q.color} rounded-xl p-4 text-sm font-semibold flex items-center justify-between border border-[var(--card-border)] hover:opacity-80 transition-opacity`}
          >
            {q.label} <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
          </Link>
        ))}
      </div>
    </div>
  )
}
