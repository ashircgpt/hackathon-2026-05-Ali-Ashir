import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth gate for /kitchen and /admin routes.
// Cookie signing (using AUTH_SECRET) is wired in Milestone 3.
// This file runs on the Edge runtime — no Prisma, no Node-only imports.

const KITCHEN_COOKIE = "pizza314_kitchen_auth";
const ADMIN_COOKIE = "pizza314_admin_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/kitchen")) {
    const cookie = request.cookies.get(KITCHEN_COOKIE);
    if (!cookie?.value) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url),
      );
    }
  }

  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get(ADMIN_COOKIE);
    if (!cookie?.value) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kitchen/:path*", "/admin/:path*"],
};
