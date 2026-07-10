import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtDecrypt, decodeJwt } from "jose"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  const isAuthRoute = pathname.startsWith("/login")
  const isDashboard = pathname.startsWith("/dashboard")
  const isUserPortal = pathname.startsWith("/user-portal")

  // Get the NextAuth session token from cookies (v5 beta)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value

  let role: string | undefined
  let isLoggedIn = false

  if (sessionToken) {
    try {
      // Decode JWT without verification - sufficient for routing decisions
      const decoded = decodeJwt(sessionToken)
      role = decoded.role as string | undefined
      isLoggedIn = true
    } catch {
      isLoggedIn = false
    }
  }

  const isUserRole = role === "user"

  // Redirect logged-in users away from login page
  if (isAuthRoute) {
    if (isLoggedIn) {
      const redirectTo = isUserRole ? "/user-portal" : "/dashboard"
      return NextResponse.redirect(new URL(redirectTo, req.nextUrl))
    }
    return NextResponse.next()
  }

  // Block unauthenticated users
  if (!isLoggedIn && (isDashboard || isUserPortal)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Block regular users from accessing /dashboard
  if (isDashboard && isUserRole) {
    return NextResponse.redirect(new URL("/user-portal", req.nextUrl))
  }

  // Block non-user roles from accessing /user-portal
  if (isUserPortal && !isUserRole && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)"],
}
