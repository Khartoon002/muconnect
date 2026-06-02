import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users, BookOpen, MessageSquare, CreditCard, TrendingUp, Bell } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Dashboard — M-Connect" }

function StatCard({
  label, value, icon: Icon, color, href,
}: { label: string; value: number | string; icon: any; color: string; href?: string }) {
  const inner = (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || (role !== "ADMIN" && role !== "LECTURER")) redirect("/dashboard")

  const [students, lecturers, courses, openFeedbacks, unpaidFees, unreadNotifs, recentFeedbacks, announcements] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "LECTURER" } }),
    prisma.course.count(),
    prisma.feedback.count({ where: { status: "OPEN" } }),
    prisma.feePayment.count({ where: { status: "PENDING" } }),
    prisma.notification.count({ where: { read: false } }),
    prisma.feedback.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.announcement.findMany({ orderBy: { publishedAt: "desc" }, take: 3 }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">2024/2025 Academic Session Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Students"      value={students}      icon={Users}         color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" />
        <StatCard label="Lecturers"           value={lecturers}     icon={TrendingUp}    color="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" />
        <StatCard label="Total Courses"       value={courses}       icon={BookOpen}      color="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" />
        <StatCard label="Open Feedbacks"      value={openFeedbacks} icon={MessageSquare} color="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
          href="/admin/feedback" />
        <StatCard label="Pending Fee Payments" value={unpaidFees}   icon={CreditCard}    color="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" />
        <StatCard label="Unread Notifications" value={unreadNotifs} icon={Bell}          color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent feedback */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)]">Recent Feedback</h2>
            <Link href="/admin/feedback" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recentFeedbacks.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">No feedback submitted</p>
          ) : (
            <ul className="space-y-3">
              {recentFeedbacks.map((f) => (
                <li key={f.id} className="border-b border-[var(--card-border)] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{f.user.name}</p>
                    <span className="text-[10px] font-semibold bg-[var(--background)] border border-[var(--card-border)] px-2 py-0.5 rounded-full text-[var(--muted)] shrink-0">
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] truncate mt-0.5">{f.category} — {f.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent announcements */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)]">Recent Announcements</h2>
            <Link href="/admin/announcements" className="text-xs text-blue-600 hover:underline">Post new</Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 text-center">No announcements posted</p>
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="border-b border-[var(--card-border)] pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">{a.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-[var(--muted)] line-clamp-1">{a.body}</p>
                    <span className="text-[10px] text-[var(--muted)] shrink-0 ml-2">
                      {new Date(a.publishedAt).toLocaleDateString("en-NG")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/announcements"
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Post Announcement</p>
            <p className="text-xs text-[var(--muted)]">Publish news to students</p>
          </div>
        </Link>
        <Link
          href="/admin/feedback"
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Manage Feedback</p>
            <p className="text-xs text-[var(--muted)]">{openFeedbacks} open item{openFeedbacks !== 1 ? "s" : ""} pending</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
