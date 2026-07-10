import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  const isAuthRoute = pathname.startsWith("/login")
  const isDashboard = pathname.startsWith("/dashboard")
  const isUserPortal = pathname.startsWith("/user-portal")

  // Get the NextAuth JWT session token from cookies
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value

  const isLoggedIn = !!sessionToken

  let role: string | undefined
  if (sessionToken) {
    try {
      // Manually decode the JWT payload (base64) without any library
      const payloadBase64 = sessionToken.split(".")[1]
      if (payloadBase64) {
        const decoded = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString("utf-8")
        )
        role = decoded.role
      }
    } catch {
      // If decode fails, treat as not logged in for protected routes
    }
  }

  const isUserRole = role === "user"

  // Redirect logged-in users away from login page
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(isUserRole ? "/user-portal" : "/dashboard", req.nextUrl)
      )
    }
    return NextResponse.next()
  }

  // Block unauthenticated users from protected routes
  if (!isLoggedIn && (isDashboard || isUserPortal)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Block regular users from accessing /dashboard
  if (isDashboard && isUserRole) {
    return NextResponse.redirect(new URL("/user-portal", req.nextUrl))
  }

  // Block admin/tech from accessing /user-portal
  if (isUserPortal && isLoggedIn && !isUserRole) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)"],
}
