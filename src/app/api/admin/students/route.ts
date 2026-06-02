import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || (role !== "ADMIN" && role !== "LECTURER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true, name: true, email: true,
      matricNumber: true, department: true, faculty: true, level: true,
      phone: true, createdAt: true,
      _count: { select: { courses: true, results: true, feePayments: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(students)
}
