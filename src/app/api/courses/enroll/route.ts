import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

  const existing = await prisma.courseEnrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId,
      session: course.session,
      semester: course.semester,
    },
  })

  if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 })

  const enrollment = await prisma.courseEnrollment.create({
    data: {
      userId: session.user.id,
      courseId,
      session: course.session,
      semester: course.semester,
    },
  })

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      type: "REGISTRATION",
      title: "Course Registration Successful",
      message: `You have successfully registered for ${course.code}: ${course.title}`,
    },
  })

  return NextResponse.json(enrollment, { status: 201 })
}
