import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { 
  prisma: any;
  pool: Pool | undefined;
};

// Create or reuse pg connection pool
const pool = globalForPrisma.pool || new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

// Bulletproof check: Recreate PrismaClient if global cache is stale (missing new models)
const isCacheValid = globalForPrisma.prisma && "mensajeContacto" in globalForPrisma.prisma;

export const prisma = isCacheValid
  ? globalForPrisma.prisma
  : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

