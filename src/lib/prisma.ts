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

function resolvePrisma(): PrismaClient {
  const client = getFreshOrCachedClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

/**
 * Inicialización perezosa: evita ejecutar createPrismaClient al cargar el módulo.
 * En Vercel, `next build` importa este archivo sin tener aún DATABASE_URL disponible en algunos pasos.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = resolvePrisma();
    const value = Reflect.get(client, prop, client) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
