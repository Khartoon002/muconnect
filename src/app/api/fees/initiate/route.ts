import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const FEE_SCHEDULE: Record<string, number> = {
  "School Fees":    75000,
  "Hostel Fees":    45000,
  "Acceptance Fee": 15000,
}

const schema = z.object({
  feeType:  z.string().min(1),
  session:  z.string().regex(/^\d{4}\/\d{4}$/, "Invalid session format"),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { feeType, session: academicSession } = parsed.data

  const amount = FEE_SCHEDULE[feeType]
  if (!amount) {
    return NextResponse.json({ error: "Unknown fee type" }, { status: 400 })
  }

  const existing = await prisma.feePayment.findFirst({
    where: {
      userId:  session.user.id,
      feeType,
      session: academicSession,
      status:  "PAID",
    },
  })
  if (existing) {
    return NextResponse.json({ error: "This fee has already been paid" }, { status: 409 })
  }

  const reference = `REF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  const payment = await prisma.feePayment.create({
    data: {
      userId: session.user.id,
      amount,
      feeType,
      session: academicSession,
      status: "PENDING",
      reference,
    },
  })

  await new Promise((resolve) => setTimeout(resolve, 1500))

  const updated = await prisma.feePayment.update({
    where: { id: payment.id },
    data: { status: "PAID", paidAt: new Date() },
  })

  await prisma.notification.create({
    data: {
      userId:  session.user.id,
      type:    "FEE",
      title:   "Fee Payment Confirmed",
      message: `Your ${feeType} payment of ₦${amount.toLocaleString()} for ${academicSession} has been confirmed. Reference: ${reference}`,
    },
  })

  return NextResponse.json(updated)
}
