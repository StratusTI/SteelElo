import { PrismaQuickLinkRepository } from "@/src/repositories/prisma/prisma-quick-link-repository";
import { DeleteQuickLinkUseCase } from "../delete-quick-link";

export function makeDeleteQuickLinkUseCase(): DeleteQuickLinkUseCase {
  const quickLinkRepository = new PrismaQuickLinkRepository();

  return new DeleteQuickLinkUseCase(quickLinkRepository);
}
