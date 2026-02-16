import { PrismaStickyRepository } from "@/src/repositories/prisma/prisma-sticky-repository";
import { UpdateStickyUseCase } from "../update-sticky";

export function makeUpdateStickyUseCase(): UpdateStickyUseCase {
  const stickyRepository = new PrismaStickyRepository();

  return new UpdateStickyUseCase(stickyRepository);
}
