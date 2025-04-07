

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath =
    path === "/" || path === "/login" || path === "/register" || path === "/forgot-password" || path.startsWith("/api/")

  const userId = request.cookies.get("userId")?.value

  if (!isPublicPath && !userId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (userId && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
