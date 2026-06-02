"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { CreditCard, CheckCircle, Clock, XCircle, Loader2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeePayment {
  id: string
  feeType: string
  amount: number
  session: string
  status: string
  reference: string | null
  paidAt: string | null
  createdAt: string
}

const FEE_TYPES = [
  { type: "School Fees",    amount: 75000 },
  { type: "Hostel Fees",    amount: 45000 },
  { type: "Acceptance Fee", amount: 15000 },
]

const STATUS_STYLES: Record<string, { color: string; icon: any; label: string }> = {
  PAID:    { color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",   icon: CheckCircle, label: "Paid" },
  PENDING: { color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400", icon: Clock,        label: "Pending" },
  FAILED:  { color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",           icon: XCircle,     label: "Failed" },
}

export default function FeesPage() {
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState<{ type: string; amount: number } | null>(null)
  const [paying, setPaying] = useState(false)

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/fees")
      const data = await res.json()
      setPayments(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load fee data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const isPaid = (type: string) => payments.some((p) => p.feeType === type && p.status === "PAID")

  async function handlePay() {
    if (!dialog) return
    setPaying(true)
    try {
      const res = await fetch("/api/fees/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeType: dialog.type, session: "2024/2025" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")
      toast.success(`${dialog.type} payment confirmed!`)
      setDialog(null)
      fetchPayments()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setPaying(false)
    }
  }

  const totalPaid = payments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Fee Payments</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">2024/2025 Academic Session</p>
      </div>

      {/* Summary banner */}
      {totalPaid > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-green-100 text-xs">Total paid this session</p>
            <p className="text-2xl font-bold">₦{totalPaid.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Fee cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEE_TYPES.map((fee) => {
          const paid = isPaid(fee.type)
          return (
            <div key={fee.type} className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{fee.type}</p>
                  <p className="text-2xl font-bold text-[var(--foreground)] mt-1">₦{fee.amount.toLocaleString()}</p>
                  <span className={cn(
                    "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-xs font-medium",
                    paid
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                  )}>
                    {paid ? <CheckCircle className="w-3 h-3" strokeWidth={2.5} /> : <XCircle className="w-3 h-3" strokeWidth={2.5} />}
                    {paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  paid ? "bg-green-100 dark:bg-green-900/40" : "bg-[var(--background)]"
                )}>
                  <CreditCard className={cn("w-5 h-5", paid ? "text-green-600 dark:text-green-400" : "text-[var(--muted)]")} strokeWidth={2.5} />
                </div>
              </div>
              {!paid && (
                <button
                  onClick={() => setDialog({ type: fee.type, amount: fee.amount })}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Pay Now
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Payment history */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--card-border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--background)] border-b border-[var(--card-border)]">
              <tr>
                {["Fee Type", "Amount", "Session", "Status", "Date Paid", "Reference"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">No payment history</td>
                </tr>
              ) : payments.map((p) => {
                const s = STATUS_STYLES[p.status] ?? STATUS_STYLES.PENDING
                const SIcon = s.icon
                return (
                  <tr key={p.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{p.feeType}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]">₦{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{p.session}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium", s.color)}>
                        <SIcon className="w-3 h-3" strokeWidth={2.5} /> {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG") : "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">{p.reference ?? "—"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm dialog */}
      {dialog && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Confirm Payment</h3>
            <p className="text-sm text-[var(--muted)] mb-5">
              You are about to pay{" "}
              <span className="font-semibold text-[var(--foreground)]">₦{dialog.amount.toLocaleString()}</span>{" "}
              for <span className="font-semibold text-[var(--foreground)]">{dialog.type}</span> — 2024/2025 session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDialog(null)}
                disabled={paying}
                className="flex-1 px-4 py-2.5 border border-[var(--card-border)] rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
