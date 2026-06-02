import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const results = await prisma.result.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: [{ session: "desc" }, { semester: "asc" }],
  })

  return NextResponse.json(results)
}
