import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const feedbacks = await prisma.feedback.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(feedbacks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { category, message } = await req.json()
  if (!category || !message) {
    return NextResponse.json({ error: "category and message required" }, { status: 400 })
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: session.user.id,
      category,
      message,
      status: "OPEN",
    },
  })

  return NextResponse.json(feedback, { status: 201 })
}
