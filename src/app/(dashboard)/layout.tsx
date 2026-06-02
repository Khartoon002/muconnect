"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, BookOpen, FileText, CreditCard,
  Bell, MessageSquare, Menu, X, LogOut, User, ChevronDown,
  Sun, Moon, Monitor,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme, type Theme } from "@/app/providers"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses",   label: "Courses",   icon: BookOpen },
  { href: "/results",   label: "Results",   icon: FileText },
  { href: "/fees",      label: "Fees",      icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/feedback",  label: "Feedback",  icon: MessageSquare },
]

function NavLink({ href, label, icon: Icon, badge }: {
  href: string; label: string; icon: any; badge?: number
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
        active ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
      )}>
        <Icon className={cn("w-4 h-4", active ? "text-white" : "text-slate-500 dark:text-slate-400")} strokeWidth={2.5} />
      </div>
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const options: { value: Theme; icon: any; label: string }[] = [
    { value: "light",  icon: Sun,     label: "Light" },
    { value: "dark",   icon: Moon,    label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ]
  const current = options.find(o => o.value === theme) ?? options[2]
  const Icon = current.icon
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Toggle theme"
      >
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl py-1 z-20">
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { setTheme(o.value); setOpen(false) }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors",
                  theme === o.value
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                    : "text-[var(--foreground)] hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <o.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function UniversityLogo() {
  return (
    <svg className="w-8 h-8 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1e40af" />
      <polygon points="24,11 7,20 24,29 41,20" fill="white" />
      <polygon points="12,23.5 12,33 24,38 36,33 36,23.5 24,28.5" fill="rgba(255,255,255,0.85)" />
      <line x1="41" y1="18" x2="41" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="41" cy="31.5" r="2.5" fill="white" />
    </svg>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/notifications/unread-count")
      .then(r => r.json())
      .then(d => setUnreadCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  const user = session?.user as any

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-200",
        "bg-[var(--card)] border-r border-[var(--card-border)]",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--card-border)]">
          <UniversityLogo />
          <div>
            <p className="font-bold text-sm text-[var(--foreground)]">M-Connect</p>
            <p className="text-xs text-[var(--muted)]">Student Portal</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-[var(--muted)]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              {...item}
              badge={item.href === "/notifications" ? unreadCount : undefined}
            />
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-[var(--card-border)] p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-[var(--muted)] capitalize">{user?.role?.toLowerCase() ?? "student"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[var(--card)] border-b border-[var(--card-border)] px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-[var(--muted)]" strokeWidth={2.5} />
          </button>

          <div className="flex-1" />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications bell */}
          <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5 text-[var(--muted)]" strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>

          {/* Avatar menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-[var(--muted)]" strokeWidth={2.5} />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl py-1 z-20">
                  <button
                    onClick={() => { setUserMenuOpen(false); router.push("/dashboard") }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" strokeWidth={2.5} /> Profile
                  </button>
                  <hr className="my-1 border-[var(--card-border)]" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2.5} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
