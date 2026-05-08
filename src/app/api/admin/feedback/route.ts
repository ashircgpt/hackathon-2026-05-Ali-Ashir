import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/feedback:
 *   get:
 *     tags: [admin]
 *     summary: Get all feedback blocks (admin)
 *     description: >
 *       Returns all feedback entries in ascending chain order (oldest first).
 *       Used by the admin ledger page for chain display and verification.
 *       Requires admin cookie.
 *     security:
 *       - adminCookie: []
 *     responses:
 *       200:
 *         description: Feedback chain in ascending order
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
 *                     $ref: '#/components/schemas/Feedback'
 */
export async function GET() {
  const feedbackRows = await prisma.feedback.findMany({
    include: {
      order: {
        include: {
          layers: { include: { menuItem: true }, orderBy: { zIndex: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "asc" }, // ascending preserves chain order
  });
  return ok(feedbackRows);
}
