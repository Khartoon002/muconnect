import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, body, targetRole } = await req.json()
  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 })
  }

  const announcement = await prisma.announcement.create({
    data: { title, body, targetRole: targetRole || null },
  })

  const users = await prisma.user.findMany({
    where: targetRole ? { role: targetRole } : {},
    select: { id: true },
  })

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "ANNOUNCEMENT" as const,
      title,
      message: body,
    })),
  })

  return NextResponse.json(announcement, { status: 201 })
}
