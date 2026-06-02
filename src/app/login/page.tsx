"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn, signOut } from "next-auth/react"
import { Loader2, ArrowRight, BookOpen, FileText, CreditCard, Eye, EyeOff, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type FormData = z.infer<typeof schema>

const features = [
  { icon: BookOpen,   label: "Course Registration",   desc: "Register for your semester courses in seconds" },
  { icon: FileText,   label: "Academic Results",       desc: "View grades, GPA, and print transcripts" },
  { icon: CreditCard, label: "Fee Payments",           desc: "Pay and track all your school fees securely" },
]

export default function LoginPage() {
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
      setError("Invalid email or password. Please try again.")
      return
    }

    // Verify this is a student account
    const sess = await fetch("/api/auth/session").then(r => r.json())
    const role = sess?.user?.role

    if (role === "ADMIN" || role === "LECTURER") {
      await signOut({ redirect: false })
      setError("Staff accounts must sign in through the staff portal.")
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950">

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-blob absolute w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-3xl -top-32 -left-24" />
        <div className="animate-blob-d2 absolute w-[400px] h-[400px] rounded-full bg-indigo-500/25 blur-3xl top-1/2 -right-20" />
        <div className="animate-blob-d4 absolute w-[350px] h-[350px] rounded-full bg-sky-400/20 blur-3xl bottom-0 left-1/3" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Main glass card */}
      <div className="glass relative w-full max-w-4xl rounded-3xl overflow-hidden animate-fade-up">
        <div className="flex flex-col lg:flex-row min-h-[560px]">

          {/* ── Left panel — info ── */}
          <div className="hidden lg:flex flex-col justify-between p-10 w-[42%] bg-white/5 border-r border-white/10">
            {/* Logo */}
            <div className="animate-fade-up-d1">
              <div className="flex items-center gap-3 mb-12">
                <div className="animate-float w-11 h-11 shrink-0">
                  <UniversityLogo />
                </div>
                <div>
                  <p className="font-bold text-white text-base leading-none">M-Connect</p>
                  <p className="text-white/50 text-[11px] mt-0.5">University Portal</p>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-snug mb-3">
                Your academic life,<br />
                <span className="text-blue-300">simplified.</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                One secure place for everything you need during your university journey.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4 animate-fade-up-d2">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-blue-200" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-none mb-0.5">{f.label}</p>
                    <p className="text-white/50 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/25 text-xs animate-fade-up-d3">
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
                  <p className="text-white/50 text-xs">University Portal</p>
                </div>
              </div>

              <div className="mb-1 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-300" strokeWidth={2.5} />
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-widest">Student Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
              <p className="text-white/50 text-sm mb-8">Sign in to your student account</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="off"
                    placeholder="Enter your email address"
                    className={cn(
                      "glass-input w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/35 font-medium",
                      errors.email && "border-red-400/60"
                    )}
                  />
                  {errors.email && <p className="text-red-300 text-xs mt-1.5">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={cn(
                        "glass-input w-full px-4 py-3.5 rounded-2xl text-sm text-white placeholder:text-white/35 font-medium pr-12",
                        errors.password && "border-red-400/60"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
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
                  <div className="bg-red-500/15 border border-red-400/30 rounded-2xl px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-blue-50 active:scale-[0.98] disabled:opacity-60 text-blue-700 font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-blue-950/40 hover:shadow-xl hover:shadow-blue-950/50 mt-2"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                    : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  ← Back to home
                </Link>
                <Link href="/login/admin" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  Staff login →
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
