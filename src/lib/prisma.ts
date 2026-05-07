// Prisma client singleton — see prisma/CLAUDE.md for rules.
// Never call `new PrismaClient()` anywhere else in the codebase.
// TODO Milestone 1 data layer: uncomment after `prisma init` and schema creation.

// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = global as unknown as { prisma: PrismaClient };
//
// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
//   });
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export {};
