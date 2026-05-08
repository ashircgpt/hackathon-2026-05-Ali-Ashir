import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [system]
 *     summary: Service health check
 *     description: Returns service status, name, timestamp, and version. No auth required.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: pizza314
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 0.1.0
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "pizza314",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  });
}
