import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10)

  await prisma.user.upsert({
    where: { email: "admin@mconnect.edu.ng" },
    update: {},
    create: {
      email: "admin@mconnect.edu.ng",
      name: "Admin User",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  const student = await prisma.user.upsert({
    where: { email: "student@mconnect.edu.ng" },
    update: {},
    create: {
      email: "student@mconnect.edu.ng",
      name: "Test Student",
      password: hashedPassword,
      role: Role.STUDENT,
      matricNumber: "MTC/2021/001",
      department: "Computer Science",
      faculty: "Science",
      level: 300,
    },
  })

  const course = await prisma.course.upsert({
    where: { code: "CSC301" },
    update: {},
    create: {
      code: "CSC301",
      title: "Software Engineering",
      units: 3,
      department: "Computer Science",
      level: 300,
      semester: 1,
      session: "2024/2025",
    },
  })

  await prisma.course.upsert({
    where: { code: "CSC303" },
    update: {},
    create: {
      code: "CSC303",
      title: "Database Management Systems",
      units: 3,
      department: "Computer Science",
      level: 300,
      semester: 1,
      session: "2024/2025",
    },
  })

  await prisma.course.upsert({
    where: { code: "CSC305" },
    update: {},
    create: {
      code: "CSC305",
      title: "Computer Networks",
      units: 2,
      department: "Computer Science",
      level: 300,
      semester: 1,
      session: "2024/2025",
    },
  })

  await prisma.result.upsert({
    where: { userId_courseId_session_semester: { userId: student.id, courseId: course.id, session: "2023/2024", semester: 2 } },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      score: 72,
      grade: "B",
      session: "2023/2024",
      semester: 2,
    },
  })

  await prisma.feePayment.upsert({
    where: { reference: "REF-SCHOOL-2024" },
    update: {},
    create: {
      userId: student.id,
      amount: 75000,
      feeType: "School Fees",
      session: "2024/2025",
      status: "PAID",
      reference: "REF-SCHOOL-2024",
      paidAt: new Date(),
    },
  })

  await prisma.announcement.create({
    data: {
      title: "Welcome to 2024/2025 Session",
      body: "Registration for the 2024/2025 academic session is now open. All students are expected to complete their registration within the stipulated time.",
      targetRole: null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: student.id,
      type: "ANNOUNCEMENT",
      title: "Welcome to 2024/2025 Session",
      message: "Registration for the 2024/2025 academic session is now open.",
    },
  })

  console.log("Seed complete:", { course })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
