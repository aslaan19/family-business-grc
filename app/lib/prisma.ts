// app/lib/prisma.ts
import PrismaClientPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Support both CJS default export and named export depending on bundler/version
const PrismaClient =
  (PrismaClientPkg as unknown as { PrismaClient?: unknown }).PrismaClient ??
  (PrismaClientPkg as unknown);

type PrismaClientType = InstanceType<typeof import("@prisma/client").PrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

function createPrismaClient(): PrismaClientType {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool    = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClient as any)({ adapter }) as PrismaClientType;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}