"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  Bell, BookOpen, CreditCard, FileText, Megaphone, Settings, Loader2, CheckCheck, InboxIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "@/lib/date-utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  REGISTRATION: { icon: BookOpen, color: "text-blue-600 bg-blue-50" },
  FEE: { icon: CreditCard, color: "text-green-600 bg-green-50" },
  RESULT: { icon: FileText, color: "text-purple-600 bg-purple-50" },
  ANNOUNCEMENT: { icon: Megaphone, color: "text-orange-600 bg-orange-50" },
  SYSTEM: { icon: Settings, color: "text-gray-600 bg-gray-100" },
}

const FILTER_TABS = ["All", "Unread", "Registration", "Fee", "Result", "Announcement"] as const
type FilterTab = typeof FILTER_TABS[number]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>("All")
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    setMarkingAll(true)
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success("All notifications marked as read")
    } finally {
      setMarkingAll(false)
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === "All") return true
    if (filter === "Unread") return !n.read
    return n.type === filter.toUpperCase()
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <InboxIcon className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter !== "All" ? "Try switching the filter above" : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM
            const Icon = config.icon
            return (
              <button
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={cn(
                  "w-full text-left flex gap-4 p-4 rounded-xl border transition-colors",
                  n.read
                    ? "bg-white border-gray-200 hover:bg-gray-50"
                    : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("font-medium text-sm", n.read ? "text-gray-700" : "text-gray-900")}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt))}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
