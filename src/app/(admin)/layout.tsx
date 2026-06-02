"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, Megaphone, MessageSquare, LogOut, User,
  Sun, Moon, Monitor, Users, BookOpen, FileText, Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme, type Theme } from "@/app/providers"
import { useState } from "react"

const adminNav = [
  { href: "/admin",                label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/students",       label: "Students",    icon: Users },
  { href: "/admin/courses",        label: "Courses",     icon: BookOpen },
  { href: "/admin/results",        label: "Results",     icon: FileText },
  { href: "/admin/announcements",  label: "Announcements", icon: Megaphone },
  { href: "/admin/feedback",       label: "Feedback",    icon: MessageSquare },
]

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
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Toggle theme"
      >
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-full ml-2 top-0 w-28 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl py-1 z-20">
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { setTheme(o.value); setOpen(false) }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm flex items-center gap-2 capitalize transition-colors",
                  theme === o.value
                    ? "text-blue-600 dark:text-blue-400"
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

function NavItem({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: any; onClick?: () => void }) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
        active ? "bg-white/20" : "bg-slate-800"
      )}>
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const user = session?.user as any
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-30 w-60 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shrink-0 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <UniversityLogo />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">M-Connect</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
          <button
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
          {adminNav.map(item => (
            <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <ThemeToggle />
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase() ?? "admin"}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login/admin" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <UniversityLogo />
            <span className="font-bold text-white text-sm">M-Connect Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
