import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error: any) {
      console.error("Database error:", {
        target: params.model + "." + params.action,
        error: error.message,
      });

      // Throw a user-friendly error
      throw new Error(
        "An error occurred while accessing the database. Please try again later."
      );
    }
  });

  return client;
}

// Create the prisma client instance
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Save the instance in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
