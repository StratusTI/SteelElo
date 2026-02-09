import { PrismaQuickLinkRepository } from "@/src/repositories/prisma/prisma-quick-link-repository";
import { CreateQuickLinkUseCase } from "../create-quick-link";

export function makeCreateQuickLinkUseCase(): CreateQuickLinkUseCase {
  const quickLinkRepository = new PrismaQuickLinkRepository();

  return new CreateQuickLinkUseCase(quickLinkRepository);
}
