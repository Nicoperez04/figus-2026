import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida");
  }
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

/** Dev/HMR can leave a cached PrismaClient from an older generate; that instance has no new delegates (e.g. `friend`). */
function getFreshOrCachedClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const friendOk =
    cached && typeof (cached as { friend?: { findMany?: unknown } }).friend?.findMany === "function";
  if (cached && !friendOk) {
    void cached.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
    return createPrismaClient();
  }
  return cached ?? createPrismaClient();
}

export const prisma = getFreshOrCachedClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
