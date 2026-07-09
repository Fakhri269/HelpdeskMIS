import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const role = (req.auth as { user?: { role?: string } })?.user?.role
  const isUserRole = role === "user"
  
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isUserPortal = req.nextUrl.pathname.startsWith("/user-portal")
  
  // Redirect logged-in users away from login page
  if (isAuthRoute) {
    if (isLoggedIn) {
      const redirectTo = isUserRole ? "/user-portal" : "/dashboard"
      return NextResponse.redirect(new URL(redirectTo, req.nextUrl))
    }
    return null
  }
  
  // Block unauthenticated users
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
  
  // Block regular users from accessing /dashboard
  if (isDashboard && isUserRole) {
    return NextResponse.redirect(new URL("/user-portal", req.nextUrl))
  }

  // Block non-user roles from accessing /user-portal
  if (isUserPortal && !isUserRole) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }
  
  return null
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)"],
}

