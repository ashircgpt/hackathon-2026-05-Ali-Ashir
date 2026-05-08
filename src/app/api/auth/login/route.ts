import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api-response";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ROLES = ["kitchen", "admin"] as const;
type Role = (typeof ROLES)[number];

const COOKIE_NAMES: Record<Role, string> = {
  kitchen: "pizza314_kitchen_auth",
  admin: "pizza314_admin_auth",
};

/** Produce the expected cookie value: sha256(role:AUTH_SECRET). */
function cookieValue(role: Role): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-me";
  return crypto
    .createHash("sha256")
    .update(`${role}:${secret}`)
    .digest("hex");
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Authenticate kitchen or admin staff
 *     description: >
 *       Validates passphrase against KITCHEN_PASSPHRASE or ADMIN_PASSPHRASE
 *       env vars. On success, sets a signed HttpOnly cookie valid for 24 hours.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [passphrase, role]
 *             properties:
 *               passphrase:
 *                 type: string
 *                 example: kitchen_demo
 *               role:
 *                 type: string
 *                 enum: [kitchen, admin]
 *                 example: kitchen
 *     responses:
 *       200:
 *         description: Login successful — cookie set
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Invalid passphrase
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Auth not configured (env var missing)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const { passphrase, role } = body as Record<string, unknown>;

  // Validate role
  if (!role || !ROLES.includes(role as Role)) {
    return fail("role must be 'kitchen' or 'admin'", ["Invalid role"]);
  }

  // Validate passphrase
  if (!passphrase || typeof passphrase !== "string" || passphrase.trim() === "") {
    return fail("passphrase is required", ["passphrase is required"]);
  }

  const typedRole = role as Role;

  // Check env var is configured
  const envKey = typedRole === "kitchen" ? "KITCHEN_PASSPHRASE" : "ADMIN_PASSPHRASE";
  const expectedPassphrase = process.env[envKey];
  if (!expectedPassphrase) {
    console.error(`[auth/login] ${envKey} env var is not set`);
    return fail("Auth not configured on server", [], 500);
  }

  // Constant-time comparison to prevent timing attacks
  const suppliedBuf = Buffer.from(passphrase.trim());
  const expectedBuf = Buffer.from(expectedPassphrase);
  const match =
    suppliedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(suppliedBuf, expectedBuf);

  if (!match) {
    return fail("Invalid passphrase", [], 401);
  }

  // Set signed HttpOnly cookie
  const cookieName = COOKIE_NAMES[typedRole];
  const value = cookieValue(typedRole);

  const response = NextResponse.json(
    { success: true, data: { role: typedRole } },
    { status: 200 },
  );

  response.cookies.set(cookieName, value, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
