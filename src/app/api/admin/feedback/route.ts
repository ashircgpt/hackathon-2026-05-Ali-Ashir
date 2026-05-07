import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

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
