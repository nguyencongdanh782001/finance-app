import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const getDatabaseUrl = () => {
  const isProductionDeployment = process.env.VERCEL_ENV === "production";
  const databaseUrl = isProductionDeployment
    ? process.env.DATABASE_URL
    : process.env.DEV_DATABASE_URL_PRISMA_DATABASE_URL ||
      process.env.DEV_DATABASE_URL_POSTGRES_URL ||
      process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing database connection URL");
  }

  return databaseUrl;
};

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "development") globalForPrisma.prisma = prisma;

export default prisma;
