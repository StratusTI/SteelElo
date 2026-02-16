import { PrismaStickyRepository } from "@/src/repositories/prisma/prisma-sticky-repository";
import { CreateStickyUseCase } from "../create-sticky";

export function makeCreateStickyUseCase(): CreateStickyUseCase {
  const stickyRepository = new PrismaStickyRepository();

  return new CreateStickyUseCase(stickyRepository);
}
