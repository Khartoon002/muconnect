import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

function scoreToGrade(score: number): string {
  if (score >= 70) return "A"
  if (score >= 60) return "B"
  if (score >= 50) return "C"
  if (score >= 45) return "D"
  if (score >= 40) return "E"
  return "F"
}

const schema = z.object({
  studentId: z.string().min(1),
  courseId:  z.string().min(1),
  score:     z.number().min(0).max(100),
  session:   z.string().regex(/^\d{4}\/\d{4}$/),
  semester:  z.number().int().min(1).max(2),
})

export async function GET() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || (role !== "ADMIN" && role !== "LECTURER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = await prisma.result.findMany({
    include: {
      user:   { select: { name: true, matricNumber: true } },
      course: { select: { code: true, title: true, units: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return NextResponse.json(results)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || (role !== "ADMIN" && role !== "LECTURER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { studentId, courseId, score, session: academicSession, semester } = parsed.data
  const grade = scoreToGrade(score)

  const result = await prisma.result.upsert({
    where: { userId_courseId_session_semester: { userId: studentId, courseId, session: academicSession, semester } },
    update: { score, grade },
    create: { userId: studentId, courseId, score, grade, session: academicSession, semester },
  })

  await prisma.notification.create({
    data: {
      userId:  studentId,
      type:    "RESULT",
      title:   "Result Published",
      message: `Your result for ${academicSession} Semester ${semester} has been uploaded. Grade: ${grade} (${score}/100).`,
    },
  })

  return NextResponse.json(result, { status: 201 })
}
