import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [auth]
 *     summary: Log out kitchen or admin staff
 *     description: Clears both auth cookies (kitchen and admin) and returns success.
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
export async function POST() {
  const response = NextResponse.json(
    { success: true, data: null },
    { status: 200 },
  );

  // Clear both cookies (belt-and-suspenders)
  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("pizza314_kitchen_auth", "", cookieOptions);
  response.cookies.set("pizza314_admin_auth", "", cookieOptions);

  return response;
}
