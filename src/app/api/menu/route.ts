import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/menu:
 *   get:
 *     tags: [menu]
 *     summary: Get available menu items
 *     description: >
 *       Returns all menu items where isAvailable is true, ordered by layerType
 *       then sortOrder. Used by the customer pizza builder orbit ring.
 *     responses:
 *       200:
 *         description: Available menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 */
export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ layerType: "asc" }, { sortOrder: "asc" }],
    });
    return ok(items);
  } catch (err) {
    console.error("[/api/menu] error:", err);
    return fail("Failed to load menu", [], 500);
  }
}
