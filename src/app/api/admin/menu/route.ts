import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/menu:
 *   get:
 *     tags: [admin]
 *     summary: Get all menu items (admin)
 *     description: >
 *       Returns ALL menu items including unavailable ones.
 *       Used by the admin menu management page to show the full catalogue.
 *       Requires admin cookie.
 *     security:
 *       - adminCookie: []
 *     responses:
 *       200:
 *         description: All menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Not authenticated
 */
export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ layerType: "asc" }, { sortOrder: "asc" }],
  });
  return ok(items);
}
