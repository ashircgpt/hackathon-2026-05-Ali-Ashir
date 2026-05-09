import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildClient() {
  const base = process.env.DATABASE_URL ?? "";
  // Cap pool to 1 to avoid exhausting Supabase free-tier session limit (15)
  const url = base.includes("connection_limit")
    ? base
    : `${base}${base.includes("?") ? "&" : "?"}connection_limit=1`;
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
