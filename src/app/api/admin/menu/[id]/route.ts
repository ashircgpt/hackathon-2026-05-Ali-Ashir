import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/menu/{id}:
 *   patch:
 *     tags: [admin]
 *     summary: Toggle menu item availability
 *     description: >
 *       Updates the isAvailable flag on a menu item. When set to false, the item
 *       will no longer appear in the customer-facing GET /api/menu response and
 *       will not be selectable in the pizza builder orbit ring.
 *       Requires admin cookie.
 *     security:
 *       - adminCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isAvailable]
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Updated menu item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Menu item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    return fail("Invalid menu item ID", [], 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const { isAvailable } = body as Record<string, unknown>;

  if (typeof isAvailable !== "boolean") {
    return fail("isAvailable must be a boolean", ["isAvailable is required and must be true or false"]);
  }

  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return fail("Menu item not found", [], 404);

  const updated = await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });

  return ok(updated);
}
