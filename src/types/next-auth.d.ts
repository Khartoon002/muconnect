import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "STUDENT" | "LECTURER" | "ADMIN"
    } & DefaultSession["user"]
  }

  interface User {
    role: "STUDENT" | "LECTURER" | "ADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "STUDENT" | "LECTURER" | "ADMIN"
  }
}
