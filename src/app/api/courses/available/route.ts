import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const courses = await prisma.course.findMany({
    where: {
      department: user.department ?? undefined,
      level: user.level ?? undefined,
    },
    include: {
      enrollments: {
        where: { userId: user.id },
      },
    },
  })

  return NextResponse.json(courses)
}
