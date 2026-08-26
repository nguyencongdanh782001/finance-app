import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

const getDatabaseUrl = () => {
  const isProductionDeployment =
    process.env.VERCEL_ENV === "production" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "production";
  const databaseUrl = isProductionDeployment
    ? process.env.PRO_DATABASE_URL
    : process.env.DEV_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      isProductionDeployment
        ? "Missing PRO_DATABASE_URL for production deployment"
        : "Missing DEV_DATABASE_URL or DATABASE_URL",
    );
  }

  return databaseUrl;
};

const getPrismaClient = () => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  });

  const prisma = new PrismaClient({
    adapter,
  });

  globalForPrisma.prisma = prisma;

  return prisma;
};

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const value = Reflect.get(getPrismaClient(), prop);

    if (typeof value === "function") {
      return value.bind(getPrismaClient());
    }

    return value;
  },
});

export default prisma;
