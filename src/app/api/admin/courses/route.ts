import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  code:       z.string().min(3).max(20).toUpperCase(),
  title:      z.string().min(3).max(200),
  units:      z.number().int().min(1).max(6),
  department: z.string().min(2),
  level:      z.number().int().min(100).max(900),
  semester:   z.number().int().min(1).max(2),
  session:    z.string().regex(/^\d{4}\/\d{4}$/),
})

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || (role !== "ADMIN" && role !== "LECTURER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const courses = await prisma.course.findMany({
    orderBy: [{ department: "asc" }, { level: "asc" }, { code: "asc" }],
    include: { _count: { select: { enrollments: true } } },
  })

  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const existing = await prisma.course.findUnique({ where: { code: parsed.data.code } })
  if (existing) {
    return NextResponse.json({ error: "A course with this code already exists" }, { status: 409 })
  }

  const course = await prisma.course.create({ data: parsed.data })
  return NextResponse.json(course, { status: 201 })
}
