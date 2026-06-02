"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn, signOut } from "next-auth/react"
import { Loader2, ArrowRight, ShieldCheck, Users, Megaphone, MessageSquare, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type FormData = z.infer<typeof schema>

const features = [
  { icon: Users,        label: "Student Management",    desc: "View and manage all enrolled students" },
  { icon: Megaphone,    label: "Announcements",          desc: "Publish news and updates to the portal" },
  { icon: MessageSquare,label: "Feedback Management",   desc: "Track and resolve student feedback" },
]

export default function AdminLoginPage() {
  const [error, setError]       = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const result = await signIn("credentials", {
      email:    data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid credentials. Access denied.")
      return
    }

    // Verify this is a staff account
    const sess = await fetch("/api/auth/session").then(r => r.json())
    const role = sess?.user?.role

    if (role === "STUDENT") {
      await signOut({ redirect: false })
      setError("Student accounts must use the student login portal.")
      return
    }

    window.location.href = "/admin"
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-blob absolute w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-3xl -top-32 -right-24" />
        <div className="animate-blob-d2 absolute w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl bottom-0 left-0" />
        <div className="animate-blob-d4 absolute w-[300px] h-[300px] rounded-full bg-slate-600/20 blur-3xl top-1/2 right-1/3" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Main glass card */}
      <div className="glass-dark relative w-full max-w-4xl rounded-3xl overflow-hidden animate-fade-up">
        <div className="flex flex-col lg:flex-row min-h-[560px]">

          {/* ── Left panel — info ── */}
          <div className="hidden lg:flex flex-col justify-between p-10 w-[42%] bg-white/[0.03] border-r border-white/[0.07]">
            <div className="animate-fade-up-d1">
              <div className="flex items-center gap-3 mb-12">
                <div className="animate-float w-11 h-11 shrink-0">
                  <UniversityLogo />
                </div>
                <div>
                  <p className="font-bold text-white text-base leading-none">M-Connect</p>
                  <p className="text-white/30 text-[11px] mt-0.5">Staff Portal</p>
                </div>
              </div>

              <div className="w-14 h-14 bg-blue-600/30 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-snug mb-3">
                Administrative<br />
                <span className="text-blue-400">Access Panel</span>
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Restricted to authorized staff only. Manage the university portal from here.
              </p>
            </div>

            <div className="space-y-4 animate-fade-up-d2">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-slate-300" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold leading-none mb-0.5">{f.label}</p>
                    <p className="text-white/30 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/15 text-xs animate-fade-up-d3">
              © {new Date().getFullYear()} M-Connect University Portal
            </p>
          </div>

          {/* ── Right panel — form ── */}
          <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-sm animate-fade-up-d1">

              {/* Mobile logo */}
              <div className="flex items-center gap-3 mb-8 lg:hidden">
                <UniversityLogo className="w-10 h-10" />
                <div>
                  <p className="font-bold text-white">M-Connect</p>
                  <p className="text-white/40 text-xs">Staff Portal</p>
                </div>
              </div>

              <div className="mb-1 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Restricted Access</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Staff Sign In</h1>
              <p className="text-white/35 text-sm mb-8">Admin &amp; lecturer portal only</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Staff Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="off"
                    placeholder="Enter your staff email"
                    className={cn(
                      "glass-input w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/25 font-medium",
                      errors.email && "border-red-400/60"
                    )}
                  />
                  {errors.email && <p className="text-red-300 text-xs mt-1.5">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={cn(
                        "glass-input w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/25 font-medium pr-12",
                        errors.password && "border-red-400/60"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPass
                        ? <EyeOff className="w-4 h-4" strokeWidth={2.5} />
                        : <Eye    className="w-4 h-4" strokeWidth={2.5} />
                      }
                    </button>
                  </div>
                  {errors.password && <p className="text-red-300 text-xs mt-1.5">{errors.password.message}</p>}
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/12 border border-red-400/25 rounded-2xl px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-blue-950/60 hover:shadow-xl hover:shadow-blue-900/50 mt-2"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                    : <><span>Access Portal</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between">
                <Link href="/" className="text-sm text-white/25 hover:text-white/50 transition-colors">
                  ← Back to home
                </Link>
                <Link href="/login" className="text-sm text-white/25 hover:text-white/50 transition-colors">
                  Student login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UniversityLogo({ className }: { className?: string }) {
  return (
    <svg className={cn("w-11 h-11", className)} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#1e40af" />
      <polygon points="24,11 7,20 24,29 41,20" fill="white" />
      <polygon points="12,23.5 12,33 24,38 36,33 36,23.5 24,28.5" fill="rgba(255,255,255,0.85)" />
      <line x1="41" y1="18" x2="41" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="41" cy="31.5" r="2.5" fill="white" />
    </svg>
  )
}
