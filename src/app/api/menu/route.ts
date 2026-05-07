import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: [{ layerType: "asc" }, { sortOrder: "asc" }],
  });
  return ok(items);
}
