import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  const isAuthPage = pathname.startsWith("/login")
  const isPublicPath = pathname === "/"
  const isAdminPath = pathname.startsWith("/admin")
  const role = (req.auth?.user as any)?.role as string | undefined

  if (!isLoggedIn && !isAuthPage && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && isAuthPage) {
    if (role === "ADMIN" || role === "LECTURER") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (isLoggedIn && isAdminPath) {
    if (role !== "ADMIN" && role !== "LECTURER") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
