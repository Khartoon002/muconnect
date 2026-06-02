import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}
