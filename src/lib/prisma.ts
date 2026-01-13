import { PrismaClient as PrismaClientElo } from "@/src/generated/elo";
import { PrismaClient as PrismaClientSteel } from "@/src/generated/steel";

const globalForPrisma = globalThis as unknown as {
  prismaElo: PrismaClientElo;
  prismaSteel: PrismaClientSteel;
};

export const prismaSteel =
  globalForPrisma.prismaSteel ??
  new PrismaClientSteel({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export const prismaElo =
  globalForPrisma.prismaElo ??
  new PrismaClientElo({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaSteel = prismaSteel;
  globalForPrisma.prismaElo = prismaElo;
}
