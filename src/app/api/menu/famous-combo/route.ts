import { ok, fail } from "@/lib/api-response";
import { computeTopCombo } from "@/lib/combo";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/menu/famous-combo:
 *   get:
 *     tags: [menu]
 *     summary: Get the most famous pizza combo
 *     description: >
 *       Returns the most frequently ordered ingredient combination from SERVED
 *       orders. Used to auto-populate the Most Famous Combo banner on the
 *       customer table UI. Public endpoint — no auth required.
 *     responses:
 *       200:
 *         description: Top combo or null if no SERVED orders exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/TopCombo'
 *                     - type: 'null'
 */
export async function GET() {
  try {
    const combo = await computeTopCombo();
    return ok(combo);
  } catch (err) {
    console.error("[/api/menu/famous-combo] error:", err);
    return fail("Failed to compute combo", [], 500);
  }
}
