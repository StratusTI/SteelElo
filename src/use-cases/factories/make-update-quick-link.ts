import { PrismaQuickLinkRepository } from "@/src/repositories/prisma/prisma-quick-link-repository";
import { UpdateQuickLinkUseCase } from "../update-quick-link";

export function makeUpdateQuickLinkUseCase(): UpdateQuickLinkUseCase {
  const quickLinkRepository = new PrismaQuickLinkRepository();

  return new UpdateQuickLinkUseCase(quickLinkRepository);
}
