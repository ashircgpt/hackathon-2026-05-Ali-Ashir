import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth gate for /kitchen and /admin routes.
// Uses Web Crypto API (crypto.subtle) — compatible with Next.js Edge runtime.
// Cookie value = SHA-256(role:AUTH_SECRET), set by POST /api/auth/login.

const KITCHEN_COOKIE = "pizza314_kitchen_auth";
const ADMIN_COOKIE   = "pizza314_admin_auth";

/** Compute expected cookie value using Web Crypto API (Edge-compatible). */
async function expectedCookieValue(role: "kitchen" | "admin"): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-me";
  const input  = `${role}:${secret}`;
  const data   = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/kitchen")) {
    const cookie = request.cookies.get(KITCHEN_COOKIE);
    if (!cookie?.value) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url),
      );
    }
    // Validate cookie value to prevent trivial forgery
    const expected = await expectedCookieValue("kitchen");
    if (cookie.value !== expected) {
      const res = NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url),
      );
      res.cookies.set(KITCHEN_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get(ADMIN_COOKIE);
    if (!cookie?.value) {
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url),
      );
    }
    // Validate cookie value
    const expected = await expectedCookieValue("admin");
    if (cookie.value !== expected) {
      const res = NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url),
      );
      res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kitchen/:path*", "/admin/:path*"],
};
