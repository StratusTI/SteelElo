import { PrismaQuickLinkRepository } from "@/src/repositories/prisma/prisma-quick-link-repository";
import { GetQuickLinksUseCase } from "../get-quick-links";

export function makeGetQuickLinksUseCase(): GetQuickLinksUseCase {
  const quickLinkRepository = new PrismaQuickLinkRepository();

  return new GetQuickLinksUseCase(quickLinkRepository);
}
