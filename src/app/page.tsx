import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BookOpen, FileText, CreditCard, Bell, MessageSquare,
  GraduationCap, Shield, ArrowRight, CheckCircle2, TrendingUp, Clock,
} from "lucide-react"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* ── Nav ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UniversityLogo className="w-8 h-8" />
            <div className="leading-none">
              <p className="font-bold text-sm">M-Connect</p>
              <p className="text-[10px] text-[var(--muted)]">University Portal</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
            <a href="#how" className="hover:text-[var(--foreground)] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[var(--foreground)] transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login/admin" className="hidden sm:block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Staff Login
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Student Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-blue-600/8 dark:bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-16">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border border-blue-200/70 dark:border-blue-800/70">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              2025/2026 Academic Session — Now Live
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] mb-6">
              One portal.<br />
              <span className="text-blue-600 dark:text-blue-400">Your entire</span><br />
              academic life.
            </h1>

            <p className="text-base sm:text-lg text-[var(--muted)] mb-8 max-w-[420px] leading-relaxed">
              Register courses, check results, pay fees, and get announcements
              — all in one secure place built for Nigerian university students.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 hover:shadow-blue-600/35"
              >
                <GraduationCap className="w-4 h-4" /> Access Student Portal
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--background)] px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                See Features
              </a>
            </div>

            <div className="flex flex-wrap gap-5 text-xs text-[var(--muted)]">
              {["Secure JWT Auth", "Real-time Alerts", "Mobile Friendly"].map(b => (
                <span key={b} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" strokeWidth={2.5} />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right: dashboard mockup */}
          <div className="hidden lg:flex justify-end">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-[var(--card-border)] bg-[var(--card)]">
        <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-3 divide-x divide-[var(--card-border)]">
          {[
            { value: "12,000+", label: "Active Students" },
            { value: "400+",    label: "Courses Listed" },
            { value: "28",      label: "Departments" },
          ].map(s => (
            <div key={s.label} className="text-center px-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{s.value}</p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Get started in minutes</h2>
            <p className="text-sm text-[var(--muted)] max-w-xs mx-auto">
              No app to download, no form to fill. Your department handles setup.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-9 left-[calc(33%+1rem)] right-[calc(33%+1rem)] border-t-2 border-dashed border-[var(--card-border)]" />

            {[
              {
                n: "01",
                title: "Get your credentials",
                desc: "Your student email and password are issued at department registration. No self-signup needed.",
              },
              {
                n: "02",
                title: "Sign in to M-Connect",
                desc: "Log in with your university email. Your courses, results, and profile load automatically.",
              },
              {
                n: "03",
                title: "Manage your academics",
                desc: "Register courses, track your GPA, pay fees, and stay updated — all from your dashboard.",
              },
            ].map(s => (
              <div key={s.n} className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs mb-5 relative z-10">
                  {s.n}
                </div>
                <h3 className="font-semibold text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — bento grid ── */}
      <section id="features" className="py-24 px-6 bg-[var(--card)] border-y border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything a student needs</h2>
            <p className="text-sm text-[var(--muted)] max-w-xs mx-auto">Purpose-built for the Nigerian university experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Hero feature card */}
            <div className="lg:col-span-2 bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full" />
              <div className="absolute right-16 top-8 w-20 h-20 bg-white/5 rounded-full" />
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-2">Course Registration</h3>
              <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
                Browse courses filtered to your department and level. Register with one click,
                view your unit load, and track what you're taking this semester.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Department-aware", "Unit tracking", "Semester-based"].map(t => (
                  <span key={t} className="bg-white/15 text-white text-[11px] px-3 py-1 rounded-full font-medium">{t}</span>
                ))}
              </div>
            </div>

            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-semibold text-sm mb-2">Academic Results</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Scores, grades, and GPA per semester. Always current, always private.
              </p>
            </div>

            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-semibold text-sm mb-2">Fee Payments</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Pay school fees securely and access a full history of your payments with references.
              </p>
            </div>

            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Bell className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-semibold text-sm mb-2">Smart Notifications</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Instant alerts when results drop, payments confirm, or admin posts an announcement.
              </p>
            </div>

            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-semibold text-sm mb-2">Feedback System</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Submit complaints or suggestions and track their resolution in real time.
              </p>
            </div>

            <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 text-white">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-semibold text-sm mb-2">Secure by Default</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                JWT authentication and encrypted sessions. Your academic record stays yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — dark ── */}
      <section className="relative py-28 px-6 bg-slate-900 dark:bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <UniversityLogo className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start your session today</h2>
          <p className="text-slate-400 mb-10 leading-relaxed max-w-md mx-auto">
            Log in with the credentials issued by your department to access your full student dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/30"
            >
              <GraduationCap className="w-4 h-4" /> Student Login
            </Link>
            <Link
              href="/login/admin"
              className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 text-white border border-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Staff / Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--card-border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <UniversityLogo className="w-6 h-6" />
            <span className="font-semibold">M-Connect</span>
            <span className="text-[var(--muted)] text-xs">University Portal</span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} M-Connect. Built for Nigerian university students.
          </p>
        </div>
      </footer>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="relative w-[400px] select-none pointer-events-none">
      {/* Top-right floating badge */}
      <div className="absolute -top-5 -right-5 z-10 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--foreground)]">6 courses</p>
          <p className="text-[10px] text-[var(--muted)]">18 units registered</p>
        </div>
      </div>

      {/* Browser window */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Chrome bar */}
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-[var(--card-border)]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-[var(--background)] rounded-md px-3 py-1 text-[9px] text-[var(--muted)] ml-2 font-mono">
            mconnect.edu.ng/dashboard
          </div>
        </div>

        {/* Sidebar + content */}
        <div className="flex" style={{ height: "280px" }}>
          {/* Mini sidebar */}
          <div className="w-14 bg-[var(--background)] border-r border-[var(--card-border)] flex flex-col items-center py-4 gap-3 shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            {[
              { Icon: BookOpen,     active: true },
              { Icon: FileText,     active: false },
              { Icon: CreditCard,   active: false },
              { Icon: Bell,         active: false },
            ].map(({ Icon, active }, i) => (
              <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? "bg-blue-600" : "bg-slate-100 dark:bg-slate-800"}`}>
                <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-slate-400"}`} strokeWidth={2.5} />
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 p-4 overflow-hidden space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-2.5 w-28 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="w-7 h-7 bg-blue-600 rounded-full" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "GPA",     value: "4.12", color: "text-green-600 dark:text-green-400" },
                { label: "Courses", value: "6",    color: "text-blue-600 dark:text-blue-400" },
                { label: "Fees",    value: "Paid", color: "text-emerald-600 dark:text-emerald-400" },
              ].map(c => (
                <div key={c.label} className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-2.5">
                  <p className={`text-xs font-extrabold ${c.color}`}>{c.value}</p>
                  <p className="text-[9px] text-[var(--muted)] mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Notification rows */}
            <div className="space-y-2">
              {[
                { title: "Result Published",  sub: "CSC 301 · 82 / 100",   dot: "bg-blue-500",  bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50" },
                { title: "Fee Confirmed",     sub: "School Fees · ₦85,000", dot: "bg-green-500", bg: "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50" },
                { title: "Announcement",      sub: "Exam timetable released",dot: "bg-orange-500",bg: "bg-[var(--background)] border-[var(--card-border)]" },
              ].map(n => (
                <div key={n.title} className={`flex items-start gap-2 border rounded-xl p-2.5 ${n.bg}`}>
                  <div className={`w-1.5 h-1.5 ${n.dot} rounded-full mt-1 shrink-0`} />
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--foreground)]">{n.title}</p>
                    <p className="text-[9px] text-[var(--muted)]">{n.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-left floating badge */}
      <div className="absolute -bottom-5 -left-5 z-10 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--foreground)]">CGPA: 4.12</p>
          <p className="text-[10px] text-[var(--muted)]">First Class standing</p>
        </div>
      </div>
    </div>
  )
}

function UniversityLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#1e40af" />
      <polygon points="24,11 7,20 24,29 41,20" fill="white" />
      <polygon points="12,23.5 12,33 24,38 36,33 36,23.5 24,28.5" fill="rgba(255,255,255,0.85)" />
      <line x1="41" y1="18" x2="41" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="41" cy="31.5" r="2.5" fill="white" />
    </svg>
  )
}
