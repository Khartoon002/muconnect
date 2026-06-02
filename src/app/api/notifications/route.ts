import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const unread = req.nextUrl.searchParams.get("unread") === "true"

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(unread ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(notifications)
}
