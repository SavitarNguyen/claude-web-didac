import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Get the pathname
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/auth/signin", "/auth/signup", "/auth/error"]

  // Protected paths that require authentication
  const protectedPaths = ["/profile", "/settings"]

  // Admin paths that require admin or teacher role
  const adminPaths = ["/admin"]

  // Check if the path is public
  const isPublicPath = publicPaths.some((publicPath) => path.startsWith(publicPath))

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((protectedPath) => path.startsWith(protectedPath))

  // Check if the path is admin
  const isAdminPath = adminPaths.some((adminPath) => path.startsWith(adminPath))

  // If the path is public and the user is logged in, redirect to the dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If the path is protected and the user is not logged in, redirect to the login page
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // If the path is admin and the user is not an admin or teacher, redirect to the dashboard
  if (isAdminPath && token?.role !== "admin" && token?.role !== "teacher") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Update the matcher configuration to be more specific and exclude API routes
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, _next, and other system files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg)).*)",
  ],
}

