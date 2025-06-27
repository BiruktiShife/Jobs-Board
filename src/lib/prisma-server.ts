import { PrismaClient } from "@prisma/client";

declare global {
  var __globalPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"],
  });
} else {
  if (!global.__globalPrisma) {
    global.__globalPrisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  prisma = global.__globalPrisma;
}

// Add middleware for error handling
prisma.$use(async (params, next) => {
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

export { prisma };
