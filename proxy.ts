import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"

const publicRoutes = ["/login", "/register"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = await getCurrentUser()

  // ---------- SUDAH LOGIN ----------
  if (user) {
    // 1. Cegah akses ke halaman auth (login/register)
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return NextResponse.redirect(new URL("/", request.url))
    }

    // 2. Redirect root "/" sesuai role
    if (pathname === "/") {
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      // user biasa tetap di "/"
      return NextResponse.next()
    }

    // 3. Proteksi halaman admin
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // ---------- BELUM LOGIN ----------
  else {
    // Izinkan akses ke public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Redirect ke login untuk halaman lain
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}