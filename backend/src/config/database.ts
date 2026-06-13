import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Prisma Client Singleton (Prisma 7 — Driver Adapter Pattern)
 *
 * Prisma 7 requires an explicit driver adapter instead of reading
 * the connection URL from schema.prisma. We use @prisma/adapter-pg
 * with the node-postgres (pg) driver.
 *
 * In development, hot-reloading can cause multiple PrismaClient instances.
 * This pattern ensures only one instance exists across the entire application.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  } as any);
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
