import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildFeedbackBlock } from "@/lib/hash";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     tags: [feedback]
 *     summary: Submit customer feedback for a SERVED order
 *     description: >
 *       Appends a new block to the feedback hash chain. The order must be in
 *       SERVED status and must not already have feedback. Each block records
 *       contentHash, prevHash, timestamp, and blockHash for tamper detection.
 *       The admin ledger can verify chain integrity client-side.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, content]
 *             properties:
 *               orderId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 42
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "Amazing pizza, loved the crispy base!"
 *     responses:
 *       201:
 *         description: Feedback block created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Validation error or order not yet SERVED
 *       404:
 *         description: Order not found
 *       409:
 *         description: Feedback already submitted for this order
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const { orderId, content } = body as Record<string, unknown>;
  const errors: string[] = [];

  if (orderId === undefined || orderId === null) {
    errors.push("orderId is required");
  } else if (typeof orderId !== "number" || !Number.isInteger(orderId) || orderId < 1) {
    errors.push("orderId must be a positive integer");
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("content is required and must be a non-empty string");
  }

  if (errors.length > 0) return fail("Validation failed", errors);

  const order = await prisma.order.findUnique({
    where: { id: orderId as number },
    include: { feedback: true },
  });

  if (!order) return fail("Order not found", [], 404);

  if (order.status !== "SERVED") {
    return fail("Feedback can only be submitted for SERVED orders", [], 400);
  }

  if (order.feedback) {
    return fail("Feedback has already been submitted for this order", [], 409);
  }

  const trimmedContent = (content as string).trim();

  const feedback = await prisma.$transaction(async (tx) => {
    const lastBlock = await tx.feedback.findFirst({
      orderBy: { createdAt: "desc" },
    });
    const prevHash = lastBlock?.blockHash ?? "0";

    const { contentHash, timestamp, blockHash } = buildFeedbackBlock(
      trimmedContent,
      prevHash,
    );

    return tx.feedback.create({
      data: {
        orderId: orderId as number,
        content: trimmedContent,
        contentHash,
        prevHash,
        timestamp: new Date(timestamp),
        blockHash,
      },
    });
  });

  return ok(feedback, 201);
}
